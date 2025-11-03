import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/apiService";
import { User } from "../types";
import { Loader2, ArrowLeft, Trash2, Shield, User as UserIcon } from "lucide-react";

export function AdminUserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Verificar que el usuario actual es admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/profile");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.access_token || !userId) return;

      setLoading(true);
      try {
        const response = await ApiService.getUserById(
          userId,
          session.access_token
        );

        if (response.success && response.data) {
          const data = response.data;
          setUserData(data);
          setFullName(data.full_name || "");
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || "");
          setWebsite(data.website || "");
          setRole(data.role || "user");
        } else {
          setMessage("No se pudo cargar el usuario");
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        setMessage("Error al cargar el usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token || !userId) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await ApiService.updateUserProfile(
        userId,
        {
          full_name: fullName,
          username,
          bio,
          avatar_url: avatarUrl,
          website,
          role,
        },
        session.access_token
      );

      if (response.success || response.data) {
        setMessage("Usuario actualizado correctamente");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setMessage("Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setMessage("Error al actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.access_token || !userId) return;
    
    if (!window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    setSaving(true);
    try {
      const response = await ApiService.deleteUser(userId, session.access_token);
      
      if (response.success) {
        setMessage("Usuario eliminado correctamente");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setMessage("Error al eliminar el usuario");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMessage("Error al eliminar el usuario");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">Usuario no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a perfiles
        </button>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Editar Usuario</h2>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Biografía
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Sitio web
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://ejemplo.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Foto de perfil (URL)
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="mt-3 w-20 h-20 rounded-full object-cover border-2 border-slate-600"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                Rol del usuario
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={(e) => setRole(e.target.value as "user" | "admin")}
                    className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-white">Usuario</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={(e) => setRole(e.target.value as "user" | "admin")}
                    className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                  />
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-white">Administrador</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:from-blue-700 hover:to-cyan-700 transition"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Guardar cambios"
                )}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition"
              >
                <Trash2 className="w-5 h-5" />
                Eliminar
              </button>
            </div>

            {message && (
              <p
                className={`text-center mt-4 ${
                  message.includes("Error")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}