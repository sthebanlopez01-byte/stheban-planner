"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Wallet,
  Plus,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Tab = "dashboard" | "tareas" | "calendario" | "finanzas";
type Prioridad = "alta" | "media" | "baja";
type TipoMovimiento = "ingreso" | "gasto";

type Tarea = {
  id: number;
  texto: string;
  fecha: string;
  prioridad: Prioridad;
  categoria: string;
  completada: boolean;
};

type Movimiento = {
  id: number;
  tipo: TipoMovimiento;
  concepto: string;
  monto: number;
};

const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO").format(n);

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");

  // ===== tareas =====
  const [textoTarea, setTextoTarea] = useState("");
  const [fechaTarea, setFechaTarea] = useState("");
  const [prioridadTarea, setPrioridadTarea] =
    useState<Prioridad>("media");
  const [categoriaTarea, setCategoriaTarea] =
    useState("General");
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  // ===== finanzas =====
  const [tipoMovimiento, setTipoMovimiento] =
    useState<TipoMovimiento>("ingreso");
  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [saldoAhorro, setSaldoAhorro] = useState(0);
  const [moverAhorro, setMoverAhorro] = useState("");

  // ===== calendario =====
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date()
  );

  // ===== localStorage =====
  useEffect(() => {
    const tareasGuardadas = localStorage.getItem("planner_tareas");
    const movimientosGuardados = localStorage.getItem("planner_movimientos");
    const ahorroGuardado = localStorage.getItem("planner_ahorro");

    if (tareasGuardadas) setTareas(JSON.parse(tareasGuardadas));
    if (movimientosGuardados)
      setMovimientos(JSON.parse(movimientosGuardados));
    if (ahorroGuardado) setSaldoAhorro(Number(ahorroGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem("planner_tareas", JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    localStorage.setItem(
      "planner_movimientos",
      JSON.stringify(movimientos)
    );
  }, [movimientos]);

  useEffect(() => {
    localStorage.setItem(
      "planner_ahorro",
      saldoAhorro.toString()
    );
  }, [saldoAhorro]);

  // ===== tareas funciones =====
  const agregarTarea = () => {
    if (!textoTarea.trim()) return;

    if (editandoId) {
      setTareas((prev) =>
        prev.map((t) =>
          t.id === editandoId
            ? {
                ...t,
                texto: textoTarea,
                fecha: fechaTarea,
                prioridad: prioridadTarea,
                categoria: categoriaTarea,
              }
            : t
        )
      );
      setEditandoId(null);
    } else {
      setTareas((prev) => [
        ...prev,
        {
          id: Date.now(),
          texto: textoTarea,
          fecha: fechaTarea,
          prioridad: prioridadTarea,
          categoria: categoriaTarea,
          completada: false,
        },
      ]);
    }

    setTextoTarea("");
    setFechaTarea("");
    setPrioridadTarea("media");
    setCategoriaTarea("General");
  };

  const editarTarea = (t: Tarea) => {
    setTextoTarea(t.texto);
    setFechaTarea(t.fecha);
    setPrioridadTarea(t.prioridad);
    setCategoriaTarea(t.categoria);
    setEditandoId(t.id);
  };

  const eliminarTarea = (id: number) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  const completarTarea = (id: number) => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completada: !t.completada }
          : t
      )
    );
  };
    // ===== finanzas funciones =====
  const parseMoney = (v: string) =>
    Number(v.replace(/\./g, "").replace(/,/g, "")) || 0;

  const maskMoney = (v: string) => {
    const n = v.replace(/\D/g, "");
    if (!n) return "";
    return Number(n).toLocaleString("es-CO");
  };

  const agregarMovimiento = () => {
    const valor = parseMoney(monto);
    if (!concepto || !valor) return;

    setMovimientos((prev) => [
      {
        id: Date.now(),
        tipo: tipoMovimiento,
        concepto,
        monto: valor,
      },
      ...prev,
    ]);

    setConcepto("");
    setMonto("");
  };

  const eliminarMovimiento = (id: number) => {
    setMovimientos((prev) =>
      prev.filter((m) => m.id !== id)
    );
  };

  const ingresos = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === "ingreso")
        .reduce((a, b) => a + b.monto, 0),
    [movimientos]
  );

  const gastos = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === "gasto")
        .reduce((a, b) => a + b.monto, 0),
    [movimientos]
  );

  const saldo = ingresos - gastos - saldoAhorro;

  const guardarAhorro = () => {
    const valor = parseMoney(moverAhorro);
    if (!valor || valor > saldo) return;
    setSaldoAhorro((p) => p + valor);
    setMoverAhorro("");
  };

  const retirarAhorro = () => {
    const valor = parseMoney(moverAhorro);
    if (!valor || valor > saldoAhorro) return;
    setSaldoAhorro((p) => p - valor);
    setMoverAhorro("");
  };

  // ===== calendario filtros =====
  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const tareasDelDia = tareas.filter((t) => {
    if (!t.fecha) return false;
    return sameDay(parseLocalDate(t.fecha), selectedDate);
  });

  const tareasSemana = tareas.filter((t) => {
    if (!t.fecha) return false;
    const fecha = parseLocalDate(t.fecha);

    const inicio = new Date(selectedDate);
    inicio.setDate(
      selectedDate.getDate() - selectedDate.getDay()
    );

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    return fecha >= inicio && fecha <= fin;
  });

  const tareasMes = tareas.filter((t) => {
    if (!t.fecha) return false;
    const fecha = parseLocalDate(t.fecha);

    return (
      fecha.getMonth() === selectedDate.getMonth() &&
      fecha.getFullYear() === selectedDate.getFullYear()
    );
  });

  const tileClassName = ({
    date,
    view,
  }: {
    date: Date;
    view: string;
  }) => {
    if (view !== "month") return "";

    const tarea = tareas.find(
      (t) =>
        t.fecha &&
        sameDay(parseLocalDate(t.fecha), date)
    );

    if (!tarea) return "";

    if (tarea.prioridad === "alta")
      return "bg-red-500 text-white rounded-lg";
    if (tarea.prioridad === "media")
      return "bg-yellow-400 rounded-lg";

    return "bg-green-500 text-white rounded-lg";
  };

  const menu = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "tareas",
      name: "Tareas",
      icon: <CheckSquare size={20} />,
    },
    {
      id: "calendario",
      name: "Calendario",
      icon: <CalendarDays size={20} />,
    },
    {
      id: "finanzas",
      name: "Finanzas",
      icon: <Wallet size={20} />,
    },
  ];
    return (
    <div className="min-h-screen flex bg-slate-100 text-black">
      <aside className="w-72 bg-slate-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-10">
          Stheban Planner
        </h1>

        <nav className="space-y-3">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                tab === item.id
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Dashboard
            </h2>

            <div className="grid md:grid-cols-4 gap-5">
              <Card title="Saldo" value={`$${formatCOP(saldo)}`} />
              <Card
                title="Ahorro"
                value={`$${formatCOP(saldoAhorro)}`}
              />
              <Card
                title="Ingresos"
                value={`$${formatCOP(ingresos)}`}
              />
              <Card
                title="Gastos"
                value={`$${formatCOP(gastos)}`}
              />
            </div>
          </div>
        )}

        {/* TAREAS */}
        {tab === "tareas" && (
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Tareas
            </h2>

            <div className="bg-white p-5 rounded-2xl shadow grid md:grid-cols-5 gap-4 mb-6">
              <input
                value={textoTarea}
                onChange={(e) =>
                  setTextoTarea(e.target.value)
                }
                placeholder="Nueva tarea"
                className="border rounded-xl px-4 py-3"
              />

              <input
                type="date"
                value={fechaTarea}
                onChange={(e) =>
                  setFechaTarea(e.target.value)
                }
                className="border rounded-xl px-4 py-3"
              />

              <select
                value={prioridadTarea}
                onChange={(e) =>
                  setPrioridadTarea(
                    e.target.value as Prioridad
                  )
                }
                className="border rounded-xl px-4 py-3"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>

              <input
                value={categoriaTarea}
                onChange={(e) =>
                  setCategoriaTarea(e.target.value)
                }
                placeholder="Categoría"
                className="border rounded-xl px-4 py-3"
              />

              <button
                onClick={agregarTarea}
                className="bg-blue-600 text-white rounded-xl px-5 py-3 flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Guardar
              </button>
            </div>

            <div className="space-y-4">
              {tareas.map((t) => (
                <div
                  key={t.id}
                  className={`bg-white p-5 rounded-2xl shadow border-l-8 ${
                    t.prioridad === "alta"
                      ? "border-red-500"
                      : t.prioridad === "media"
                      ? "border-yellow-500"
                      : "border-green-500"
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3
                        className={`text-xl font-semibold ${
                          t.completada
                            ? "line-through text-slate-400"
                            : ""
                        }`}
                      >
                        {t.texto}
                      </h3>

                      <p className="text-slate-500 mt-1">
                        {t.categoria} • {t.fecha}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          completarTarea(t.id)
                        }
                        className="bg-green-500 text-white p-2 rounded-lg"
                      >
                        <Check size={18} />
                      </button>

                      <button
                        onClick={() => editarTarea(t)}
                        className="bg-yellow-500 text-white p-2 rounded-lg"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          eliminarTarea(t.id)
                        }
                        className="bg-red-500 text-white p-2 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CALENDARIO */}
        {tab === "calendario" && (
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Calendario
            </h2>

            <div className="bg-white p-6 rounded-2xl shadow">
              <Calendar
                onChange={(d) =>
                  setSelectedDate(d as Date)
                }
                value={selectedDate}
                tileClassName={tileClassName}
              />

              <div className="grid md:grid-cols-3 gap-5 mt-8">
                <Panel title="Hoy" items={tareasDelDia} />
                <Panel
                  title="Semana"
                  items={tareasSemana}
                />
                <Panel title="Mes" items={tareasMes} />
              </div>
            </div>
          </div>
        )}

        {/* FINANZAS */}
        {tab === "finanzas" && (
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Finanzas
            </h2>

            <div className="bg-white p-5 rounded-2xl shadow grid md:grid-cols-4 gap-4 mb-6">
              <select
                value={tipoMovimiento}
                onChange={(e) =>
                  setTipoMovimiento(
                    e.target.value as TipoMovimiento
                  )
                }
                className="border rounded-xl px-4 py-3"
              >
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>

              <input
                value={concepto}
                onChange={(e) =>
                  setConcepto(e.target.value)
                }
                placeholder="Concepto"
                className="border rounded-xl px-4 py-3"
              />

              <input
                value={monto}
                onChange={(e) =>
                  setMonto(maskMoney(e.target.value))
                }
                placeholder="Monto"
                className="border rounded-xl px-4 py-3"
              />

              <button
                onClick={agregarMovimiento}
                className="bg-blue-600 text-white rounded-xl px-5 py-3"
              >
                Guardar
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow mb-6 flex gap-3">
              <input
                value={moverAhorro}
                onChange={(e) =>
                  setMoverAhorro(
                    maskMoney(e.target.value)
                  )
                }
                placeholder="Monto ahorro"
                className="border rounded-xl px-4 py-3"
              />

              <button
                onClick={guardarAhorro}
                className="bg-green-600 text-white px-4 rounded-xl"
              >
                Guardar
              </button>

              <button
                onClick={retirarAhorro}
                className="bg-yellow-500 text-white px-4 rounded-xl"
              >
                Retirar
              </button>
            </div>

            <div className="space-y-3">
              {movimientos.map((m) => (
                <div
                  key={m.id}
                  className="bg-white p-4 rounded-2xl shadow flex justify-between"
                >
                  <div>
                    <h3 className="font-semibold">
                      {m.concepto}
                    </h3>
                    <p className="text-slate-500">
                      {m.tipo} • $
                      {formatCOP(m.monto)}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      eliminarMovimiento(m.id)
                    }
                    className="bg-red-500 text-white p-2 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <p className="text-slate-500">{title}</p>
      <h3 className="text-3xl font-bold mt-2">
        {value}
      </h3>
    </div>
  );
}

function Panel({
  title,
  items,
}: {
  title: string;
  items: Tarea[];
}) {
  return (
    <div className="bg-slate-100 p-5 rounded-2xl">
      <h3 className="text-xl font-bold mb-3">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-slate-500">
          No hay tareas
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="bg-white p-3 rounded-xl shadow-sm"
            >
              {t.texto}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
