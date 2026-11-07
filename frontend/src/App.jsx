import { useEffect, useState } from 'react';

// credentials:'include' envía la cookie de sesión al backend.
async function api(ruta, opciones = {}) {
  const respuesta = await fetch('/api' + ruta, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opciones
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    const error = new Error(datos.error || 'Error en la solicitud');
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [login, setLogin] = useState('admin');
  const [contrasena, setContrasena] = useState('');
  const [salas, setSalas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [salaId, setSalaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');
  const [mensaje, setMensaje] = useState('');

  function mostrarError(error) {
    if (error.status === 401) {
      // Ante un 401 de ruta protegida, se vuelve a la pantalla de login.
      setUsuario(null);
    }
    setMensaje(error.message);
  }

  async function cargarDatos() {
    try {
      const [listaSalas, listaReservas] = await Promise.all([
        api('/salas'), api('/reservas')
      ]);
      setSalas(listaSalas);
      setReservas(listaReservas);
    } catch (error) {
      mostrarError(error);
    }
  }

  useEffect(() => {
    api('/yo')
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  async function entrar(evento) {
    evento.preventDefault();
    setMensaje('');
    try {
      const datos = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ usuario: login, contrasena })
      });
      setContrasena('');
      setUsuario(datos);
    } catch (error) {
      mostrarError(error);
    }
  }

  async function reservar(evento) {
    evento.preventDefault();
    setMensaje('');
    try {
      const datos = await api('/reservas', {
        method: 'POST',
        body: JSON.stringify({ salaId: Number(salaId), fecha, inicio, fin })
      });
      setMensaje(datos.mensaje);
      await cargarDatos();
    } catch (error) {
      mostrarError(error);
    }
  }

  async function salir() {
    try { await api('/logout', { method: 'POST' }); }
    catch (error) { /* También se regresa al login si la sesión venció. */ }
    setUsuario(null);
    setMensaje('');
  }

  if (cargando) return <p>Cargando...</p>;

  if (!usuario) {
    return (
      <main>
        <h1>Biblioteca - Iniciar sesión</h1>
        <form onSubmit={entrar}>
          <label>Usuario <input value={login} onChange={e => setLogin(e.target.value)} required /></label>
          <label>Contraseña <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} required /></label>
          <button>Entrar</button>
        </form>
        <p>Usuario de prueba: admin / 123456</p>
        {mensaje && <p>{mensaje}</p>}
      </main>
    );
  }

  return (
    <main>
      <h1>Reservas de salas - Biblioteca</h1>
      <p>Conectado como: {usuario.usuario} <button onClick={salir}>Cerrar sesión</button></p>
      <h2>Salas disponibles</h2>
      <ul>{salas.map(sala => <li key={sala.id}>{sala.nombre}</li>)}</ul>

      <h2>Nueva reserva</h2>
      <form onSubmit={reservar}>
        <label>Sala
          <select value={salaId} onChange={e => setSalaId(e.target.value)} required>
            <option value="">Seleccione</option>
            {salas.map(sala => <option key={sala.id} value={sala.id}>{sala.nombre}</option>)}
          </select>
        </label>
        <label>Fecha <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required /></label>
        <label>Hora inicio <input type="time" value={inicio} onChange={e => setInicio(e.target.value)} required /></label>
        <label>Hora fin <input type="time" value={fin} onChange={e => setFin(e.target.value)} required /></label>
        <button>Reservar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}

      <h2>Reservas registradas</h2>
      <table>
        <thead><tr><th>Sala</th><th>Fecha</th><th>Inicio</th><th>Fin</th></tr></thead>
        <tbody>
          {reservas.map(r => (
            <tr key={r.id}><td>{r.Sala?.nombre}</td><td>{r.fecha}</td><td>{r.inicio}</td><td>{r.fin}</td></tr>
          ))}
        </tbody>
      </table>
      {reservas.length === 0 && <p>Todavía no hay reservas.</p>}
    </main>
  );
}
