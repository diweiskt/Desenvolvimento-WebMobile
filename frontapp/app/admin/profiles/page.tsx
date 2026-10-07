"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Save, 
  Search, 
  Pencil, 
  Trash2, 
  User as UserIcon 
} from "lucide-react";
import { getToken } from "../../login/auth_service";
import "./profiles.css";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Profile {
  id: number;
  userId: number;
  fullName: string;
  birthDate: string;
  avatarUrl?: string;
  user?: User;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Estados do Formulário
  const [id, setId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | "">("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Estado de Busca
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Carregar Dados da API
  const fetchData = async () => {
    const token = getToken();
    
    // Se não houver token salvo no localStorage
    if (!token) {
      console.warn("Nenhum token encontrado em auth_token. Efetue login novamente.");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const [resProfiles, resUsers] = await Promise.all([
        fetch("http://localhost:3000/api/profiles", { headers }),
        fetch("http://localhost:3000/api/users", { headers }),
      ]);

      if (resProfiles.status === 401 || resUsers.status === 401) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        return;
      }

      if (resProfiles.ok) setProfiles(await resProfiles.json());
      if (resUsers.ok) setUsers(await resUsers.json());
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auxiliar para obter o utilizador correspondente
  const getUser = (uId: number): User | undefined => {
    return users.find((u) => u.id === uId);
  };

  // Limpar Formulário
  const handleClear = () => {
    setId(null);
    setUserId("");
    setFullName("");
    setBirthDate("");
    setAvatarUrl("");
  };

  // Submeter (POST / PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !fullName) return;

    const token = getToken();
    if (!token) return;

    const formattedDate = birthDate ? new Date(birthDate).toISOString() : null;

    const payload: any = {
      userId: Number(userId),
      fullName,
      birthDate: formattedDate,
      avatarUrl,
    };

    const url = id
      ? `http://localhost:3000/api/profiles/${id}`
      : "http://localhost:3000/api/profiles";

    const method = id ? "PUT" : "POST";

    if (id) delete payload.userId;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        handleClear();
        fetchData();
      } else {
        alert("Erro ao salvar o perfil.");
      }
    } catch (error) {
      console.error("Erro ao guardar:", error);
    }
  };

  // Editar
  const handleEdit = (profile: Profile) => {
    setId(profile.id);
    setUserId(profile.userId);
    setFullName(profile.fullName);
    setBirthDate(profile.birthDate ? profile.birthDate.split("T")[0] : "");
    setAvatarUrl(profile.avatarUrl || "");
  };

  // Eliminar
  const handleDelete = async (profileId: number) => {
    if (!confirm("Tem certeza que deseja excluir este perfil?")) return;

    const token = getToken();
    try {
      const res = await fetch(`http://localhost:3000/api/profiles/${profileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erro ao eliminar:", error);
    }
  };

  // Filtro de utilizadores para o <select>
  const usersWithProfile = useMemo(() => {
    return profiles.map((p) => Number(p.userId));
  }, [profiles]);

  const availableUsers = useMemo(() => {
    return users.filter((u) => {
      const currentId = Number(u.id);
      return !usersWithProfile.includes(currentId) || currentId === Number(userId);
    });
  }, [users, usersWithProfile, userId]);

  // Filtro de pesquisa da tabela
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const user = profile.user || getUser(profile.userId);
      const search = searchTerm.toLowerCase();
      const userName = user?.name.toLowerCase() || "";
      const userEmail = user?.email.toLowerCase() || "";
      const name = profile.fullName.toLowerCase();

      return (
        userName.includes(search) ||
        userEmail.includes(search) ||
        name.includes(search)
      );
    });
  }, [profiles, users, searchTerm]);

  return (
    <div className="profiles-container">
      <header className="page-header">
        <div>
          <h1>Manutenção de Perfis</h1>
          <p>Cadastre, visualize e edite os perfis dos usuários do sistema.</p>
        </div>
      </header>

      {/* Card 1: Formulário */}
      <div className="card">
        <h2 className="card-title">Perfil do Usuário</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            <div className="form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Usuário <span>*</span>
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(Number(e.target.value))}
                    disabled={!!id}
                    required
                  >
                    <option value="">
                      {users.length === 0
                        ? "Nenhum usuário carregado"
                        : availableUsers.length === 0
                        ? "Todos os usuários já possuem perfil"
                        : "Selecione um usuário"}
                    </option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  <span className="field-hint">
                    Cada usuário pode ter apenas um perfil.
                  </span>
                </div>

                <div className="form-group">
                  <label>
                    Nome completo <span>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Informe o nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data de nascimento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>URL do Avatar</label>
                  <input
                    type="text"
                    placeholder="https://exemplo.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                  <span className="field-hint">
                    Informe o endereço da imagem do avatar.
                  </span>
                </div>
              </div>
            </div>

            <div className="avatar-preview-box">
              <div className="avatar-circle-large">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <UserIcon size={40} className="avatar-placeholder-icon" />
                )}
              </div>
              <span className="preview-label">Pré-visualizar</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              {id ? "Atualizar Perfil" : "Salvar Perfil"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
            >
              Limpar
            </button>
          </div>
        </form>
      </div>

      {/* Card 2: Tabela */}
      <div className="card">
        <div className="table-header-row">
          <h2 className="card-title">Perfis Cadastrados</h2>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por usuário ou nome completo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Nome completo</th>
              <th>Data de nascimento</th>
              <th>Avatar</th>
              <th style={{ textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfiles.map((profile) => {
              const user = profile.user || getUser(profile.userId);
              const formattedBirth = profile.birthDate
                ? new Date(profile.birthDate).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })
                : "-";

              return (
                <tr key={profile.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-icon">
                        <UserIcon size={16} />
                      </div>
                      <div className="user-info">
                        <strong>{user?.name || `Usuário #${profile.userId}`}</strong>
                        <span>{user?.email || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td>{profile.fullName}</td>
                  <td>{formattedBirth}</td>
                  <td>
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.fullName}
                        className="table-avatar-img"
                      />
                    ) : (
                      <div className="table-avatar-initials">
                        {profile.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(profile)}
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProfiles.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#a0aec0", padding: "24px" }}>
                  Nenhum perfil encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}