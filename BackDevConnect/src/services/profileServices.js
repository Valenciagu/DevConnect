const { supabase } = require('../lib/supabase');

class ProfileService {
    static async getAllProfiles() {
        try {
            const { data, error, count } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, bio, website, role, created_at, updated_at', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                total: count || 0
            };
        } catch (error) {
            console.error('Error al obtener perfiles:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener perfiles'
            };
        }
    }

    static async getProfileById(id) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, bio, website, role, created_at, updated_at')
                .eq('id', id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return {
                        success: false,
                        error: 'Perfil no encontrado'
                    };
                }
                throw error;
            }

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener perfil'
            };
        }
    }

    static async searchProfiles(query) {
        try {
            const { data, error, count } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url, bio, website, role, created_at', { count: 'exact' })
                .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return {
                success: true,
                data: data || [],
                total: count || 0
            };
        } catch (error) {
            console.error('Error al buscar perfiles:', error);
            return {
                success: false,
                error: error.message || 'Error al buscar perfiles'
            };
        }
    }

    static async getProfileStats() {
        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            // Obtener perfiles creados este mes
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const { count: newThisMonth, error: monthError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString());

            if (monthError) throw monthError;

            return {
                success: true,
                data: {
                    total_profiles: count || 0,
                    active_profiles: count || 0,
                    new_profiles_this_month: newThisMonth || 0
                }
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener estadísticas'
            };
        }
    }

    // 🆕 NUEVO: Actualizar perfil
    static async updateProfile(userId, profileData) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.full_name,
                    username: profileData.username,
                    bio: profileData.bio,
                    avatar_url: profileData.avatar_url,
                    website: profileData.website,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select('id, full_name, username, avatar_url, bio, website, role, created_at, updated_at')
                .single();

            if (error) throw error;

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar perfil'
            };
        }
    }
}

module.exports = ProfileService;