import { useState } from "react";
import { Eye, EyeOff, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const Navigate = useNavigate();

  interface LoginFormValues {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    // Simuler une requête d'authentification
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      const loginData: LoginFormValues = { email, password, rememberMe };
      console.log("Connexion avec:", loginData);
      // Redirection vers le dashboard après connexion
      Navigate("/dashboard");
    } catch (error) {
      console.error("Erreur de connexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-64 -top-64 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -left-64 -bottom-64 w-96 h-96 rounded-full bg-chart-1/10 blur-3xl"></div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-64 bg-chart-3/5 blur-3xl rounded-full"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo et Titre */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 14C16 12.3431 14.2091 11 12 11C9.79086 11 8 12.3431 8 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Bienvenue</h1>
          <p className="text-muted-foreground text-sm">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        {/* Carte de formulaire */}
        <div className="bg-card border border-border shadow-lg rounded-lg p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="nom@exemple.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-xs text-primary hover:text-primary/90 transition-colors"
                >
                  Mot de passe oublié?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary border-input rounded focus:ring-primary"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-muted-foreground"
              >
                Se souvenir de moi
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2 px-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Se connecter
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-border absolute w-full"></div>
            <div className="bg-card px-3 relative z-10 text-xs text-muted-foreground">
              ou
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center py-2 px-4 border border-border rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.163 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.16 22 16.42 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continuer avec GitHub
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte?{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Créer un compte <ArrowRight size={14} className="inline ml-1" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

//Deuxieme interface de Login avec Split-screen

// import { useState } from "react";
// import { Eye, EyeOff, LogIn, Github, Loader2 } from "lucide-react";
// import { motion } from "framer-motion";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   interface LoginFormValues {
//     email: string;
//     password: string;
//     rememberMe: boolean;
//   }

//   const handleLogin = async (
//     e: React.FormEvent<HTMLFormElement>
//   ): Promise<void> => {
//     e.preventDefault();
//     setIsLoading(true);

//     // Simuler une requête d'authentification
//     try {
//       await new Promise<void>((resolve) => setTimeout(resolve, 1500));
//       // Traitement de la connexion ici
//       const loginData: LoginFormValues = { email, password, rememberMe };
//       console.log("Connexion avec:", loginData);
//       // Redirection vers le tableau de bord ou la page d'accueil
//     } catch (error) {
//       console.error("Erreur de connexion:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
//         {/* Panneau gauche / image */}
//         <div className="hidden md:block w-full md:w-1/2 bg-primary p-12 relative">
//           <div className="absolute inset-0 opacity-20">
//             <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary-foreground"></div>
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-chart-3"></div>
//             <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-chart-1"></div>
//           </div>

//           <div className="relative z-10 h-full flex flex-col justify-between">
//             <div>
//               <h2 className="text-primary-foreground text-3xl font-bold mb-6">
//                 Bienvenue dans votre espace
//               </h2>
//               <p className="text-primary-foreground/80 mb-8">
//                 Connectez-vous pour accéder à votre tableau de bord et gérer vos
//                 projets.
//               </p>
//             </div>

//             <div className="text-primary-foreground">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//                 className="flex items-center mb-4"
//               >
//                 <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-4">
//                   <span className="text-primary-foreground">✓</span>
//                 </div>
//                 <span>Interface intuitive et accessible</span>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.7 }}
//                 className="flex items-center mb-4"
//               >
//                 <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-4">
//                   <span className="text-primary-foreground">✓</span>
//                 </div>
//                 <span>Système sécurisé et fiable</span>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.9 }}
//                 className="flex items-center"
//               >
//                 <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-4">
//                   <span className="text-primary-foreground">✓</span>
//                 </div>
//                 <span>Support réactif et disponible</span>
//               </motion.div>
//             </div>
//           </div>
//         </div>

//         {/* Panneau droit / formulaire */}
//         <div className="w-full md:w-1/2 bg-card p-8 md:p-12 md:pt-1">
//           <div className="mb-8">
//             <h1 className="text-2xl font-bold text-foreground mb-2">
//               Connexion
//             </h1>
//             <p className="text-muted-foreground">
//               Entrez vos identifiants pour accéder à votre compte
//             </p>
//           </div>

//           <form onSubmit={handleLogin} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-medium text-foreground mb-1"
//               >
//                 Adresse email
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
//                 placeholder="nom@exemple.com"
//                 required
//               />
//             </div>

//             <div>
//               <div className="flex items-center justify-between mb-1">
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-foreground"
//                 >
//                   Mot de passe
//                 </label>
//                 <a
//                   href="#"
//                   className="text-sm text-primary hover:text-primary/90 transition-colors"
//                 >
//                   Mot de passe oublié?
//                 </a>
//               </div>
//               <div className="relative">
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
//               />
//               <label
//                 htmlFor="remember-me"
//                 className="ml-2 block text-sm text-muted-foreground"
//               >
//                 Se souvenir de moi
//               </label>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full flex items-center justify-center py-3 px-4 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 size={18} className="animate-spin mr-2" />
//                     Connexion en cours...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn size={18} className="mr-2" />
//                     Se connecter
//                   </>
//                 )}
//               </button>
//             </div>

//             <div className="relative flex items-center justify-center">
//               <div className="border-t border-border absolute w-full"></div>
//               <div className="bg-card px-3 relative z-10 text-sm text-muted-foreground">
//                 ou
//               </div>
//             </div>

//             <div>
//               <button
//                 type="button"
//                 className="w-full flex items-center justify-center py-3 px-4 border border-border rounded-md bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
//               >
//                 <Github size={18} className="mr-2" />
//                 Continuer avec GitHub
//               </button>
//             </div>
//           </form>

//           <p className="mt-8 text-center text-sm text-muted-foreground">
//             Pas encore de compte?{" "}
//             <a
//               href="#"
//               className="font-medium text-primary hover:text-primary/90 hover:underline"
//             >
//               Créer un compte
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
