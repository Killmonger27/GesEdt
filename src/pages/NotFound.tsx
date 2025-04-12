import { useState, useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Animation d'entrée
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-chart-2/5 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-40 h-40 rounded-full bg-chart-4/5 blur-2xl"></div>
      </div>

      <div className="w-full max-w-lg z-10 text-center">
        <div
          className={`transition-all duration-1000 ${
            animationComplete
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-8"
          }`}
        >
          {/* Illustration 404 */}
          <div className="relative mx-auto w-64 h-64 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Cercle extérieur */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-border"
                  strokeWidth="1"
                  strokeDasharray="8 4"
                />

                {/* Cercle intérieur */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  className="stroke-primary/80"
                  strokeWidth="2"
                  fill="none"
                />

                {/* Texte 404 */}
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontSize: "26px", fontWeight: "bold" }}
                >
                  404
                </text>

                {/* Points cardinaux décoratifs */}
                <line
                  x1="50"
                  y1="15"
                  x2="50"
                  y2="25"
                  stroke="currentColor"
                  className="stroke-muted-foreground"
                  strokeWidth="2"
                />
                <line
                  x1="50"
                  y1="75"
                  x2="50"
                  y2="85"
                  stroke="currentColor"
                  className="stroke-muted-foreground"
                  strokeWidth="2"
                />
                <line
                  x1="15"
                  y1="50"
                  x2="25"
                  y2="50"
                  stroke="currentColor"
                  className="stroke-muted-foreground"
                  strokeWidth="2"
                />
                <line
                  x1="75"
                  y1="50"
                  x2="85"
                  y2="50"
                  stroke="currentColor"
                  className="stroke-muted-foreground"
                  strokeWidth="2"
                />

                {/* Éléments décoratifs */}
                <circle cx="50" cy="20" r="2" className="fill-primary" />
                <circle cx="50" cy="80" r="2" className="fill-primary" />
                <circle cx="20" cy="50" r="2" className="fill-primary" />
                <circle cx="80" cy="50" r="2" className="fill-primary" />
              </svg>
            </div>

            {/* Particules décoratives */}
            <div
              className="absolute top-1/4 left-0 w-3 h-3 rounded-full bg-chart-1 animate-ping opacity-70"
              style={{ animationDuration: "3s", animationDelay: "0.2s" }}
            ></div>
            <div
              className="absolute bottom-1/4 right-0 w-2 h-2 rounded-full bg-chart-3 animate-ping opacity-70"
              style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-chart-4 animate-ping opacity-70"
              style={{ animationDuration: "4s", animationDelay: "1s" }}
            ></div>
          </div>

          {/* Titre et texte */}
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Page non trouvée
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée. Veuillez
            vérifier l'URL ou utiliser les options ci-dessous.
          </p>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Home size={18} className="mr-2" />
              Page d'accueil
            </button>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <ArrowLeft size={18} className="mr-2" />
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
