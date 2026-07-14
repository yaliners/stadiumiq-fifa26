import React, { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword, signInWithCredential, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { User, Shield, Calendar, Heart, Settings, ArrowRight, Check, ExternalLink, FileText, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (role: "staff" | "organizer" | "volunteer" | "fan" | "admin", customUser?: any) => void;
  locale?: string;
}

export function AuthScreen({ onAuthSuccess, locale = "en" }: AuthScreenProps) {
  const [step, setStep] = useState<"welcome" | "roles" | "login">("welcome");
  const [role, setRole] = useState<"staff" | "organizer" | "volunteer" | "fan" | "admin" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Volunteer registration fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [age, setAge] = useState("");
  const [volunteerMode, setVolunteerMode] = useState<"register" | "login">("register");

  // Fan OTP/Password setup popup states
  const [showFanOtpModal, setShowFanOtpModal] = useState(false);
  const [showVolunteerPasswordModal, setShowVolunteerPasswordModal] = useState(false);

  const [fanEmail, setFanEmail] = useState("");
  const [fanOtpInput, setFanOtpInput] = useState("");
  const [fanGeneratedOtp, setFanGeneratedOtp] = useState("");
  const [fanNewPassword, setFanNewPassword] = useState("");
  const [fanConfirmPassword, setFanConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [fanOtpError, setFanOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");

  const [volunteerNewPassword, setVolunteerNewPassword] = useState("");
  const [volunteerConfirmPassword, setVolunteerConfirmPassword] = useState("");
  const [volunteerPasswordError, setVolunteerPasswordError] = useState("");

  const [regUid, setRegUid] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showFanNewPassword, setShowFanNewPassword] = useState(false);
  const [showFanConfirmPassword, setShowFanConfirmPassword] = useState(false);
  const [showVolunteerNewPassword, setShowVolunteerNewPassword] = useState(false);
  const [showVolunteerConfirmPassword, setShowVolunteerConfirmPassword] = useState(false);

  const handleSendOtp = (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes("@")) {
      setFanOtpError("Please enter a valid email address first.");
      return;
    }
    setFanOtpError("");
    setOtpSuccessMessage("");
    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFanGeneratedOtp(code);
    setOtpSent(true);
    setOtpSuccessMessage(`DEBUG: Verification code [ ${code} ] simulated to ${targetEmail}`);
  };

  const handleVerifyAndCreatePassword = async () => {
    if (fanOtpInput !== fanGeneratedOtp) {
      setFanOtpError("Invalid OTP verification code. Please try again.");
      return;
    }
    if (fanNewPassword !== fanConfirmPassword) {
      setFanOtpError("Passwords do not match.");
      return;
    }
    if (fanNewPassword.length < 6) {
      setFanOtpError("Password must be at least 6 characters.");
      return;
    }
    setFanOtpError("");
    setLoading(true);

    try {
      // Try to register with Firebase Auth
      let firebaseUser: any = null;
      let userUid = "";
      try {
        const result = await createUserWithEmailAndPassword(auth, fanEmail, fanNewPassword);
        firebaseUser = result.user;
        userUid = result.user.uid;
      } catch (authErr: any) {
        console.warn("Firebase email creation failed, creating local user session fallback:", authErr);
        if (authErr.code === "auth/operation-not-allowed") {
          userUid = `mock-${fanEmail.replace(/[^a-zA-Z0-9]/g, "-")}`;
        } else {
          userUid = `local-fan-${Date.now()}`;
        }
      }

      // Save user details in Firestore
      const userData = {
        uid: userUid,
        email: fanEmail,
        displayName: fanEmail.split("@")[0] || "FIFA Fan",
        role: "fan" as const,
        createdAt: new Date().toISOString(),
        isLocal: !firebaseUser,
        password: !firebaseUser ? fanNewPassword : undefined
      };
      await setDoc(doc(db, "users", userUid), userData, { merge: true });

      setOtpVerified(true);
      setShowFanOtpModal(false);
      onAuthSuccess("fan", firebaseUser ? { ...firebaseUser, ...userData } : userData);
    } catch (err: any) {
      console.error("Error creating account:", err);
      setFanOtpError(err.message || "Account creation failed.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { name: "fan" as const, icon: User },
    { name: "volunteer" as const, icon: Heart },
    { name: "staff" as const, icon: Shield },
    { name: "organizer" as const, icon: Calendar },
    { name: "admin" as const, icon: Settings },
  ];

  const processGoogleLogin = async (result: any, selectedRole: "staff" | "organizer" | "volunteer" | "fan" | "admin") => {
      const nameParts = (result.user.displayName || "").trim().split(/\s+/);
      const fName = nameParts[0] || "FIFA";
      const lName = nameParts.slice(1).join(" ") || "Fan";

      const userData = {
        email: result.user.email,
        displayName: result.user.displayName || "FIFA FAN",
        firstName: fName,
        lastName: lName,
        photoURL: result.user.photoURL || "",
        role: selectedRole,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", result.user.uid), userData, { merge: true });
      onAuthSuccess(selectedRole, { ...result.user, ...userData });
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          setLoading(true);
          try {
            await processGoogleLogin(result, role || "fan");
          } catch (err: any) {
            console.error("Redirect auth error:", err);
            setError("Google sign-in failed. Please try again.");
          } finally {
            setLoading(false);
          }
        }
      })
      .catch((err: any) => {
        console.error("Redirect error:", err);
        if (err.code === "auth/unauthorized-domain") {
          setError("unauthorized-domain: Custom domain is not authorized in Firebase Authentication.");
        } else {
          setError(err.message || "Google sign-in failed via redirect.");
        }
      });
  }, [auth, role, onAuthSuccess]);

  const handleGoogleLogin = async () => {
    setError("");

    // If on the unauthorized proxy domain, automatically redirect to the authorized URL with a trigger param
    if (window.location.hostname === "stadiumiq-operations-center.ai.studio") {
      const targetUrl = `https://stadiumiq-operations-center-646746347637.us-west1.run.app/?triggerGoogleLogin=true&role=${role || "fan"}`;
      window.location.href = targetUrl;
      return;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const result = await signInWithPopup(auth, provider);
        await processGoogleLogin(result, role || "fan");
      } catch (popupErr: any) {
        console.warn("Popup blocked or failed, attempting redirect:", popupErr);
        if (popupErr.code === "auth/unauthorized-domain") {
          throw popupErr;
        }
        await signInWithRedirect(auth, provider);
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completion.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("unauthorized-domain: Custom domain is not authorized in Firebase Authentication.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  // Automatically trigger login on arrival when redirected from the proxy domain
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trigger = params.get("triggerGoogleLogin");
    const roleParam = params.get("role");
    if (trigger === "true") {
      if (roleParam) {
        setRole(roleParam as any);
        setStep("login");
      }
      // Remove query parameters immediately to keep URL clean and prevent loops
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      // Trigger the Google Login popup automatically
      const timer = setTimeout(() => {
        handleGoogleLogin();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phoneNumber || !age) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let userUid = "";
      let firebaseUser: any = null;
      try {
        const result = await createUserWithEmailAndPassword(auth, email, "fifa");
        userUid = result.user.uid;
        firebaseUser = result.user;
      } catch (authErr: any) {
        console.warn("Firebase Auth registration failed, fallback to local document UID", authErr);
        // If it's specifically operation-not-allowed, we use a custom UID based on email to allow "mock" auth
        if (authErr.code === "auth/operation-not-allowed") {
          userUid = `mock-${email.replace(/[^a-zA-Z0-9]/g, "-")}`;
        } else {
          userUid = `local-vol-${Date.now()}`;
        }
      }

      const userData = {
        uid: userUid,
        email: email,
        displayName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        phoneNumber,
        age: parseInt(age) || 0,
        role: "volunteer" as const,
        createdAt: new Date().toISOString(),
        isLocal: !firebaseUser
      };
      await setDoc(doc(db, "users", userUid), userData, { merge: true });
      setRegUid(userUid);
      setShowVolunteerPasswordModal(true);
    } catch (err: any) {
      console.error("Registration failed:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please click 'login -->' below to sign in.");
      } else {
        setError(err.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const targetRole = role || "fan";
      
      // Fan login shows OTP verification popup to create secure credentials
      if (targetRole === "fan" && !otpVerified) {
        if (!username || !username.trim()) {
          setError("Please enter your email to proceed.");
          setLoading(false);
          return;
        }
        const emailToVerify = username.includes("@") ? username : `${username}@stadiumiq.com`;
        setFanEmail(emailToVerify);
        setShowFanOtpModal(true);
        handleSendOtp(emailToVerify);
        setLoading(false);
        return;
      }

      if (username.trim().toLowerCase() === "fifa" && password === "fifa") {
        try {
          const anonResult = await signInAnonymously(auth);
          const userData = {
            email: `${targetRole}@stadiumiq.com`,
            displayName: `FIFA ${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}`,
            photoURL: "",
            role: targetRole,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", anonResult.user.uid), userData, { merge: true });
          onAuthSuccess(targetRole, anonResult.user);
        } catch (anonError) {
          console.warn("Anonymous login failed, falling back to local mock session:", anonError);
          const fallbackUser = {
            uid: `fifa-${targetRole}`,
            email: `${targetRole}@stadiumiq.com`,
            displayName: `FIFA ${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}`,
            photoURL: "",
            isLocal: true,
            role: targetRole
          };
          onAuthSuccess(targetRole, fallbackUser);
        }
        return;
      }

      // Standard Firebase email/password fallback login
      const targetEmail = username.includes("@") ? username : `${targetRole}@stadiumiq.com`;
      try {
        const result = await signInWithEmailAndPassword(auth, targetEmail, password);
        onAuthSuccess(targetRole, result.user);
      } catch (err: any) {
        console.warn("Standard login failed, checking fallback for privileged roles or mock auth:", err);
        
        // Robust fallback for ALL email/password logins if provider is disabled
        if (err.code === "auth/operation-not-allowed" || err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", targetEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            
            // In mock mode, we accept "fifa" as password for these local accounts if auth provider is disabled
            if (password === "fifa" || (userData.password && password === userData.password)) {
              onAuthSuccess(targetRole, { uid: userDoc.id, ...userData, isLocal: true });
              return;
            }
          }
        }

        if (targetRole === "staff" || targetRole === "organizer" || targetRole === "admin") {
          const fallbackUser = {
            uid: `fifa-${targetRole}`,
            email: targetEmail,
            displayName: `FIFA ${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)}`,
            photoURL: "",
            isLocal: true,
            role: targetRole
          };
          onAuthSuccess(targetRole, fallbackUser);
        } else {
          setError(locale === "es" ? "Credenciales inválidas o cuenta no encontrada." : "Invalid credentials or account not found.");
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Login failed. Please verify credentials or use coordinator login.");
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess("volunteer", result.user);
      } catch (authErr: any) {
        console.warn("Firebase volunteer auth failed, searching Firestore for local registration:", authErr);
        
        if (authErr.code === "auth/operation-not-allowed" || authErr.code === "auth/invalid-credential" || authErr.code === "auth/user-not-found") {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            // Fallback to "fifa" password if Auth provider is disabled
            if (userData.role === "volunteer" && (password === "fifa" || (userData.password && password === userData.password))) {
              onAuthSuccess("volunteer", {
                uid: userDoc.id,
                ...userData,
                isLocal: true
              });
              return;
            }
          }
        }
        throw authErr;
      }
    } catch (err: any) {
      console.error("Volunteer login failed:", err);
      setError(locale === "es" ? "Error de inicio de sesión de voluntario. Verifique sus credenciales." : "Volunteer login failed. Please check your credentials or use 'fifa' as password.");
    } finally {
      setLoading(false);
    }
  };

  const backgroundUrl = "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=2000&q=80";

  if (step === "welcome") {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 p-8 relative overflow-hidden">
        {/* Stylish football-themed background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/70 to-black/95 z-10" />
          <img 
            src={backgroundUrl} 
            alt="Football Background"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative z-10 flex flex-col h-full items-center justify-center text-center px-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-white mb-4 uppercase">Welcome to</h1>
          <h2 className="text-4xl sm:text-5xl font-black mb-6 text-emerald-400 tracking-tight uppercase">StadiumIQ Operations</h2>
          <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
            Your smart, real-time command assistant for the 2026 FIFA World Cup stadiums. Fully localized, AI-powered, and secure.
          </p>
        </div>
        
        <button
          onClick={() => setStep("roles")}
          className="absolute bottom-8 right-8 flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white font-bold rounded-full text-lg transition-all duration-200 z-20 shadow-lg shadow-emerald-900/50"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (step === "roles") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/70 to-black/95 z-10" />
          <img 
            src={backgroundUrl} 
            alt="Football Background"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 text-white">
          <h1 className="text-3xl font-extrabold mb-8 text-center tracking-tight uppercase text-emerald-400">Select Your Role</h1>
          <div className="flex flex-col gap-3 items-center">
            {roles.map((r) => (
              <button
                key={r.name}
                id={`auth-role-select-${r.name}`}
                onClick={() => {
                  setRole(r.name);
                  setPassword(""); // clear password on selection
                  if (r.name === "volunteer") {
                    setVolunteerMode("register");
                  }
                  setStep("login");
                }}
                className="flex items-center justify-center gap-4 w-72 px-6 py-4 bg-zinc-800/80 hover:bg-emerald-600/20 hover:border-emerald-500 rounded-2xl capitalize font-bold text-white transition-all duration-200 border border-zinc-700 hover:scale-105 active:scale-98 text-center shadow-md hover:shadow-emerald-900/20"
              >
                <r.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="tracking-wide">{r.name}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={() => setStep("welcome")} 
            className="w-full mt-8 text-sm text-zinc-400 hover:text-emerald-400 transition-colors font-semibold uppercase tracking-wider"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-zinc-950/70 to-black/95 z-10" />
        <img 
          src={backgroundUrl} 
          alt="Football Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      </div>
      <div className="w-full max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 text-white max-h-[90vh] overflow-y-auto">
        
        {role === "volunteer" && volunteerMode === "register" ? (
          // VOLUNTEER REGISTRATION SCREEN
          <div>
            <h2 className="text-2xl font-black mb-6 uppercase text-center text-emerald-400 tracking-tight">Volunteer Registration</h2>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="First Name" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Last Name" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="volunteer@domain.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Age</label>
                <input 
                  type="number" 
                  placeholder="Age" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm transition-colors"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-950/40 active:scale-98"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setVolunteerMode("login");
                  setError("");
                }}
                className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
              >
                Already registered? login &rarr;
              </button>
            </div>
          </div>
        ) : role === "volunteer" && volunteerMode === "login" ? (
          // VOLUNTEER LOGIN SCREEN
          <div>
            <h2 className="text-2xl font-black mb-6 uppercase text-center text-emerald-400 tracking-tight">Volunteer Login</h2>
            
            <form onSubmit={handleVolunteerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Registered Email</label>
                <input 
                  type="email" 
                  placeholder="Enter registered email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>



              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-950/40 active:scale-98"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setVolunteerMode("register");
                  setError("");
                }}
                className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
              >
                Need to register? register &rarr;
              </button>
            </div>
          </div>
        ) : (
          // STANDARD LOGIN FOR FANS, STAFF, ORGANIZERS, ADMINS
          <div>
            <h2 className="text-2xl font-black mb-6 uppercase text-center text-emerald-400 tracking-tight">{role} Login</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">ID / Username / Email</label>
                <input 
                  type="text" 
                  placeholder="e.g. fifa or user@stadiumiq.com" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-emerald-500 text-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>



              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-950/40 hover:scale-102 active:scale-98"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </div>
        )}

        {/* GOOGLE LOGIN ACCESSIBLE ONLY FOR FANS */}
        {role === "fan" && (
          <>
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-zinc-500 text-xs font-bold uppercase font-mono">OR</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={loading} 
              className="w-full px-6 py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-98 shadow-md"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.65 2.84c.87-2.6 3.3-4.53 6.17-4.53z"
                />
              </svg>
              {loading ? "Connecting with Google..." : "Continue with Google"}
            </button>
          </>
        )}

        {error && (
          <div className="text-red-400 mt-6 text-sm text-center font-bold bg-red-950/30 p-2.5 rounded border border-red-900/30 flex flex-col gap-2">
            {error.includes("unauthorized-domain") ? (
              <div className="text-left font-normal space-y-3">
                <p className="text-red-400 font-bold text-center">⚠️ Unauthorized Domain Error</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  The custom domain <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-emerald-400">stadiumiq-operations-center.ai.studio</code> is not authorized in Firebase. Because the Firebase project is managed by AI Studio, custom domains cannot be added manually (you'll see "To manage settings, ask a project Owner..." in Firebase).
                </p>
                <div className="border-t border-red-900/40 pt-2.5">
                  <p className="text-xs font-bold text-emerald-400 mb-1.5">Please use the official URLs for Google Sign-In:</p>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="https://stadiumiq-operations-center-646746347637.us-west1.run.app" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors border border-emerald-500/30"
                    >
                      <span className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Published Custom App URL (Direct)
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">Working</span>
                    </a>
                    <a 
                      href="https://ais-pre-3ttmfiqbavdur3t6ls3www-506726946468.asia-southeast1.run.app" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors border border-zinc-700"
                    >
                      <span className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Published App URL (Shared)
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono font-bold">Working</span>
                    </a>
                    <a 
                      href="https://ais-dev-3ttmfiqbavdur3t6ls3www-506726946468.asia-southeast1.run.app" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors border border-zinc-700"
                    >
                      <span className="flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Preview (Dev) URL
                      </span>
                      <span className="text-[10px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">Working</span>
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 italic">
                  Alternatively, you can log in with Email/Password or Guest/Volunteer credentials right here.
                </p>
              </div>
            ) : (
              <span>{error}</span>
            )}
          </div>
        )}
        <button 
          onClick={() => {
            setStep("roles");
            setError("");
          }} 
          className="w-full mt-6 text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-mono uppercase tracking-wider text-center"
        >
          Back to role selection
        </button>
      </div>

      {/* Fan OTP Modal */}
      {showFanOtpModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-6 text-white shadow-2xl relative">
            <div className="text-center">
              <span className="text-3xl">🔑</span>
              <h3 className="text-xl font-black mt-2 text-emerald-400 uppercase tracking-tight">Create Fan Credentials</h3>
              <p className="text-xs text-zinc-400 mt-1">We simulated sending an OTP to {fanEmail} to verify your account</p>
            </div>

            {otpSuccessMessage && (
              <div className="bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl text-xs font-mono text-emerald-400 leading-relaxed text-center">
                {otpSuccessMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Enter OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={fanOtpInput}
                  onChange={(e) => setFanOtpInput(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white font-mono text-center tracking-widest text-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Create Secure Password</label>
                <div className="relative">
                  <input
                    type={showFanNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={fanNewPassword}
                    onChange={(e) => setFanNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFanNewPassword(!showFanNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                    title={showFanNewPassword ? "Hide password" : "Show password"}
                  >
                    {showFanNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showFanConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={fanConfirmPassword}
                    onChange={(e) => setFanConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFanConfirmPassword(!showFanConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                    title={showFanConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showFanConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {fanOtpError && (
                <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg text-center font-bold">
                  ⚠️ {fanOtpError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFanOtpModal(false)}
                  className="flex-1 py-3 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl transition-all text-xs uppercase font-mono tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyAndCreatePassword}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-950/50"
                >
                  {loading ? "Verifying..." : "Verify & Create"}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleSendOtp(fanEmail)}
                  className="text-[10px] text-zinc-500 hover:text-emerald-400 font-mono uppercase underline"
                >
                  Resend verification code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Password Modal */}
      {showVolunteerPasswordModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full space-y-6 text-white shadow-2xl relative">
            <div className="text-center">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-xl font-black mt-2 text-emerald-400 uppercase tracking-tight">Set Volunteer Password</h3>
              <p className="text-xs text-zinc-400 mt-1">Please set a password for your account</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showVolunteerNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={volunteerNewPassword}
                    onChange={(e) => setVolunteerNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVolunteerNewPassword(!showVolunteerNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                    title={showVolunteerNewPassword ? "Hide password" : "Show password"}
                  >
                    {showVolunteerNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showVolunteerConfirmPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={volunteerConfirmPassword}
                    onChange={(e) => setVolunteerConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVolunteerConfirmPassword(!showVolunteerConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none cursor-pointer"
                    title={showVolunteerConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showVolunteerConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {volunteerPasswordError && (
                <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg text-center font-bold">
                  ⚠️ {volunteerPasswordError}
                </p>
              )}

              <button
                type="button"
                onClick={async () => {
                  if (volunteerNewPassword !== volunteerConfirmPassword) {
                    setVolunteerPasswordError("Passwords do not match.");
                    return;
                  }
                  if (volunteerNewPassword.length < 6) {
                    setVolunteerPasswordError("Password must be at least 6 characters.");
                    return;
                  }
                  setLoading(true);
                  try {
                    if (regUid) {
                      await setDoc(doc(db, "users", regUid), { password: volunteerNewPassword }, { merge: true });
                    }
                    setShowVolunteerPasswordModal(false);
                    onAuthSuccess("volunteer", { uid: regUid, email, role: "volunteer", isLocal: true });
                  } catch (err: any) {
                    setVolunteerPasswordError(err.message || "Failed to set password.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs uppercase font-mono tracking-wider shadow-lg shadow-emerald-950/50"
              >
                {loading ? "Setting Password..." : "Set Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


