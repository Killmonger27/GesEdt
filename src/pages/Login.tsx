import { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { login, clearError } from "../redux/auth/authSlice";
import { LoginRequest } from "../interfaces/Authentification";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Récupérer les états depuis le store Redux
  const { isLoading, isAuthenticated, error } = useAppSelector(
    (state) => state.auth
  );

  // Rediriger si l'utilisateur est déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Effacer les erreurs lorsque les champs sont modifiés
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [email, password, dispatch, error]);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // Envoyer les données de connexion au back-end
    const loginData: LoginRequest = {
      email: email,
      password: password,
    };

    dispatch(login(loginData));

    console.log("Connexion avec:", loginData);
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
          <div> {error && <p className="text-red-500 text-sm">{error}</p>}</div>
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
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte?{" "}
          <a
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Créer un compte <ArrowRight size={14} className="inline ml-1" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
