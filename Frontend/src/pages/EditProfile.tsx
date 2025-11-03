import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/apiService";
import { Loader2, ArrowLeft, User, Mail, Globe } from "lucide-react";

export function EditProfile() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Cargar el perfil actual desde tu backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.access_token) return;

      setLoading(true);
      try {
        const response = await ApiService.getProfile(session.access_token);

        if (response.success && response.data) {
          const { full_name, username, bio, avatar_url, website } = response.data;
          setFullName(full_name || "");
          setUsername(username || "");
          setBio(bio || "");
          setAvatarUrl(avatar_url || "");
          setWebsite(website || "");
        } else {
          setMessage("No se pudo cargar el perfil.");
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        setMessage("Error al cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // Guardar cambios
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await ApiService.updateProfile(session.access_token, {
        full_name: fullName,
        username,
        bio,
        avatar_url: avatarUrl,
        website,
      });

      console.log("Respuesta del servidor:", response);

      if (response && (response.success || response.id || response.data)) {
        setMessage("Perfil actualizado correctamente");

        // Actualizar los campos si vienen en la respuesta
        if (response.data) {
          const {
            full_name,
            username: newUsername,
            bio: newBio,
            avatar_url,
            website: newWebsite,
          } = response.data;
          setFullName(full_name || "");
          setUsername(newUsername || "");
          setBio(newBio || "");
          setAvatarUrl(avatar_url || "");
          setWebsite(newWebsite || "");
        }

        // Redirigir al perfil después de 1.5 segundos
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setMessage("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setMessage("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Botón volver */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al perfil
        </button>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
          </div>

          {loading && !user ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              {/* Email (solo lectura) */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 mb-2 font-medium">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
                />
                <p className="text-slate-500 text-xs mt-1">
                  El email no se puede modificar
                </p>
              </div>

              {/* Nombre completo */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Usuario */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Biografía */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  Biografía
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Cuéntanos sobre ti..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
                <p className="text-slate-500 text-xs mt-1">
                  {bio.length} caracteres
                </p>
              </div>

              {/* Sitio web */}
              <div>
                <label className="flex items-center gap-2 text-slate-300 mb-2 font-medium">
                  <Globe className="w-4 h-4" />
                  Sitio web
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://tusitio.com"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  Foto de perfil (URL)
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {avatarUrl && (
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt="avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
                      onError={(e) => {
                        e.currentTarget.src = "";
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="text-slate-400 text-sm">Vista previa</span>
                  </div>
                )}
              </div>

              {/* Botón guardar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </button>

              {/* Mensaje de estado */}
              {message && (
                <div
                  className={`text-center py-2 px-4 rounded-lg ${
                    message.includes("Error")
                      ? "bg-red-500/10 border border-red-500/50 text-red-400"
                      : "bg-green-500/10 border border-green-500/50 text-green-400"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}