import { useEffect, useMemo, useState } from "react";
import {
  bookAppointment,
  cancelAppointment,
  createSlots,
  fetchAppointments,
  fetchPros,
  fetchSlots,
  loginUser,
  registerUser
} from "./api.js";

const emptySlot = () => ({ start: "", end: "" });

export default function App() {
  const [pros, setPros] = useState([]);
  const [selectedPro, setSelectedPro] = useState("");
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const [slotForm, setSlotForm] = useState([emptySlot()]);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT"
  });

  useEffect(() => {
    fetchPros()
      .then((response) => setPros(response.data))
      .catch(() => setPros([]));
  }, []);

  const selectedProName = useMemo(() => {
    return pros.find((pro) => pro._id === selectedPro)?.name || "";
  }, [pros, selectedPro]);

  const loadSlots = async () => {
    if (!selectedPro) return;
    const response = await fetchSlots(selectedPro);
    setSlots(response.data);
  };

  const loadAppointments = async () => {
    if (!userId) return;
    const response = await fetchAppointments(userId);
    setAppointments(response.data);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const response = await registerUser(authForm);
      setUserId(response.data.id);
      setStatus("Compte créé ✅");
    } catch (error) {
      setStatus("Erreur création de compte");
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const response = await loginUser({
        email: authForm.email,
        password: authForm.password
      });
      setToken(response.data.token);
      setUserId(response.data.user.id);
      setStatus("Connecté ✅");
    } catch (error) {
      setStatus("Erreur de connexion");
    }
  };

  const handleBook = async (slotId) => {
    if (!userId || !selectedPro) {
      setStatus("Sélectionne un pro et un utilisateur");
      return;
    }
    try {
      await bookAppointment({ userId, proId: selectedPro, slotId });
      setStatus("RDV réservé ✅");
      await loadSlots();
      await loadAppointments();
    } catch (error) {
      setStatus("Impossible de réserver");
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      setStatus("RDV annulé ✅");
      await loadAppointments();
    } catch (error) {
      setStatus("Annulation impossible");
    }
  };

  const handleSlotFormChange = (index, key, value) => {
    setSlotForm((prev) =>
      prev.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [key]: value } : slot
      )
    );
  };

  const addSlotRow = () => setSlotForm((prev) => [...prev, emptySlot()]);

  const handleCreateSlots = async (event) => {
    event.preventDefault();
    if (!selectedPro) {
      setStatus("Choisis un pro pour créer des slots");
      return;
    }
    try {
      await createSlots(selectedPro, slotForm);
      setStatus("Slots créés ✅");
      setSlotForm([emptySlot()]);
      await loadSlots();
    } catch (error) {
      setStatus("Erreur création slots");
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Mini RDV (MVP)</h1>
        <p>Front simple pour tester le booking.</p>
      </header>

      <section className="card">
        <h2>1) Authentification</h2>
        <form className="grid" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nom"
            value={authForm.name}
            onChange={(event) =>
              setAuthForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(event) =>
              setAuthForm((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={authForm.password}
            onChange={(event) =>
              setAuthForm((prev) => ({ ...prev, password: event.target.value }))
            }
          />
          <select
            value={authForm.role}
            onChange={(event) =>
              setAuthForm((prev) => ({ ...prev, role: event.target.value }))
            }
          >
            <option value="PATIENT">Patient</option>
            <option value="PRO">Pro</option>
          </select>
          <button type="submit">Créer un compte</button>
          <button type="button" onClick={handleLogin}>
            Se connecter
          </button>
        </form>
        <div className="helper">
          <span>User ID:</span>
          <input
            type="text"
            placeholder="colle l'id utilisateur"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
          {token && <span className="tag">JWT OK</span>}
        </div>
      </section>

      <section className="card">
        <h2>2) Choisir un pro</h2>
        <select
          value={selectedPro}
          onChange={(event) => setSelectedPro(event.target.value)}
        >
          <option value="">-- Sélectionner --</option>
          {pros.map((pro) => (
            <option key={pro._id} value={pro._id}>
              {pro.name} ({pro.email})
            </option>
          ))}
        </select>
        <button type="button" onClick={loadSlots}>
          Charger les slots
        </button>
      </section>

      <section className="card">
        <h2>3) Slots pour {selectedProName || "..."}</h2>
        <ul className="list">
          {slots.map((slot) => (
            <li key={slot._id}>
              <div>
                <strong>{new Date(slot.start).toLocaleString()}</strong> →{" "}
                {new Date(slot.end).toLocaleString()} ({slot.status})
              </div>
              <button
                type="button"
                disabled={slot.status !== "FREE"}
                onClick={() => handleBook(slot._id)}
              >
                Réserver
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>4) Créer des slots (rôle Pro)</h2>
        <form onSubmit={handleCreateSlots}>
          {slotForm.map((slot, index) => (
            <div className="grid" key={`slot-${index}`}>
              <input
                type="datetime-local"
                value={slot.start}
                onChange={(event) =>
                  handleSlotFormChange(index, "start", event.target.value)
                }
              />
              <input
                type="datetime-local"
                value={slot.end}
                onChange={(event) =>
                  handleSlotFormChange(index, "end", event.target.value)
                }
              />
            </div>
          ))}
          <div className="actions">
            <button type="button" onClick={addSlotRow}>
              Ajouter un slot
            </button>
            <button type="submit">Créer</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>5) Mes rendez-vous</h2>
        <button type="button" onClick={loadAppointments}>
          Charger mes RDV
        </button>
        <ul className="list">
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              <div>
                Slot: {appointment.slotId} ({appointment.status})
              </div>
              <button
                type="button"
                onClick={() => handleCancel(appointment._id)}
              >
                Annuler
              </button>
            </li>
          ))}
        </ul>
      </section>

      {status && <div className="status">{status}</div>}
    </div>
  );
}
