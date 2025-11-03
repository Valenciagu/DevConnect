import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/apiService";
import { User } from "../types";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Edit,
  Globe,
  Loader2,
  Users,
} from "lucide-react";

export function ProfilePage() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.access_token) return;

      setLoading(true);
      try {
        // Cargar perfil del usuario actual
        const profileResponse = await ApiService.getProfile(
          session.access_token
        );

        if (profileResponse.success && profileResponse.data) {
          setProfileData(profileResponse.data);
        }

        // Si es admin, cargar todos los usuarios
        if (user?.role === "admin") {
          const usersResponse = await ApiService.getAllUsers(
            session.access_token
          );
          if (usersResponse.success && usersResponse.data) {
            setAllUsers(usersResponse.data);
          }
        } else {
          // Si es usuario normal, cargar solo lista básica de perfiles
          const profilesResponse = await ApiService.getAllProfiles();
          if (profilesResponse.success && profilesResponse.data) {
            setAllUsers(profilesResponse.data);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar la información");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
          <Shield className="w-3 h-3" />
          Administrador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
        <UserIcon className="w-3 h-3" />
        Usuario
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 max-w-md">
          <p className="text-red-400">{error || "No se pudo cargar el perfil"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header con información del usuario actual */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.full_name || "Avatar"}
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-3xl font-bold text-white">
                  {profileData.full_name || "Sin nombre"}
                </h1>
                {getRoleBadge(profileData.role)}
              </div>

              <div className="space-y-2 text-slate-300">
                {profileData.username && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>@{profileData.username}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{user?.email}</span>
                </div>

                {profileData.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      {profileData.website}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Miembro desde {formatDate(profileData.created_at)}</span>
                </div>
              </div>

              {profileData.bio && (
                <p className="text-slate-300 mt-4 leading-relaxed">
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Botón editar */}
            <button
              onClick={() => navigate("/edit-profile")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Edit className="w-4 h-4" />
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">
              {user?.role === "admin" ? "Gestión de Usuarios" : "Comunidad"}
            </h2>
          </div>

          {allUsers.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No hay usuarios registrados
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers
                .filter((u) => u.id !== user?.id) // No mostrar el usuario actual
                .map((otherUser) => (
                  <div
                    key={otherUser.id}
                    className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start gap-3">
                      {otherUser.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt={otherUser.full_name || "Avatar"}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-slate-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">
                          {otherUser.full_name || "Sin nombre"}
                        </h3>
                        {otherUser.username && (
                          <p className="text-slate-400 text-sm truncate">
                            @{otherUser.username}
                          </p>
                        )}
                        <div className="mt-2">{getRoleBadge(otherUser.role)}</div>

                        {/* Botones de admin */}
                        {user?.role === "admin" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() =>
                                navigate(`/admin/user/${otherUser.id}`)
                              }
                              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                            >
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}