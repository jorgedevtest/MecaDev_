"use client";

import Image from "next/image";
import { useEffect, useRef, useState, MutableRefObject } from "react";

// Tipos para las tareas de PC
interface PcTask {
  status: keyof typeof STATUS;
  tasks: string[];
}

type PcTasks = Record<number, PcTask>;

// Cargar FontAwesome y html2pdf.js en el cliente
function useExternalScripts() {
  useEffect(() => {
    // FontAwesome
    if (!document.getElementById("fa-cdn")) {
      const fa = document.createElement("link");
      fa.rel = "stylesheet";
      fa.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      fa.id = "fa-cdn";
      document.head.appendChild(fa);
    }
  }, []);
}

const STATUS = {
  none: {
    label: "Sin tarea",
    icon: "fa-question-circle",
    class: "status-none",
  },
  maintenance: {
    label: "Mantenimiento",
    icon: "fa-tools",
    class: "status-maintenance",
  },
  updated: {
    label: "Actualizada",
    icon: "fa-check-circle",
    class: "status-updated",
  },
  problem: {
    label: "Problema",
    icon: "fa-exclamation-triangle",
    class: "status-problem",
  },
} as const;

export default function Lab46Page() {
  useExternalScripts();
  // Estados principales
  const [auxiliar, setAuxiliar] = useState<string>("Nombre del Auxiliar");
  const [turno, setTurno] = useState<string>("Mañana");
  const [fecha, setFecha] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [conclusiones, setConclusiones] = useState<string>(
    "Durante la fecha del día 24/06/2025 se hizo las colocaciones del dominio con los auxiliares del laboratorio 46 dando como resultados 38 máquinas en total con dominio en uso"
  );
  const [pcTasks, setPcTasks] = useState<PcTasks>({});
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalPcId, setModalPcId] = useState<number | null>(null);
  const [modalStatus, setModalStatus] = useState<keyof typeof STATUS>("none");
  const [modalTasks, setModalTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [stats, setStats] = useState<{
    completed: number;
    maintenance: number;
    problem: number;
    pending: number;
  }>({
    completed: 0,
    maintenance: 0,
    problem: 0,
    pending: 40,
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Actualizar estadísticas
  useEffect(() => {
    let completed = 0,
      maintenance = 0,
      problem = 0;
    for (let i = 1; i <= 40; i++) {
      const t = pcTasks[i];
      if (t) {
        if (t.status === "updated") completed++;
        else if (t.status === "maintenance") maintenance++;
        else if (t.status === "problem") problem++;
      }
    }
    setStats({
      completed,
      maintenance,
      problem,
      pending: 40 - (completed + maintenance + problem),
    });
  }, [pcTasks]);

  // Abrir modal de computadora
  const openModal = (pcId: number) => {
    setModalPcId(pcId);
    const t = pcTasks[pcId] || { status: "none", tasks: [] };
    setModalStatus(t.status);
    setModalTasks([...t.tasks]);
    setNewTask("");
    setModalOpen(true);
  };

  // Guardar tareas de computadora
  const saveModalTasks = () => {
    if (modalPcId === null) return;
    setPcTasks((prev: PcTasks) => ({
      ...prev,
      [modalPcId]: { status: modalStatus, tasks: [...modalTasks] },
    }));
    setModalOpen(false);
  };

  // Restablecer todo
  const resetAll = () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas restablecer todos los campos a sus valores originales?"
      )
    ) {
      setAuxiliar("Nombre del Auxiliar");
      setTurno("Mañana");
      setFecha(() => {
        const now = new Date();
        return now.toISOString().slice(0, 10);
      });
      setConclusiones(
        "Durante la fecha del día 24/06/2025 se hizo las colocaciones del dominio con los auxiliares del laboratorio 46 dando como resultados 38 máquinas en total con dominio en uso"
      );
      setPcTasks({});
    }
  };

  // Guardar informe (solo alerta)
  const saveReport = () => {
    const dateObj = new Date(fecha);
    const formattedDate = `${dateObj.getDate()
      .toString()
      .padStart(2, "0")}/${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${dateObj.getFullYear()}`;
    const pcWithTasks = Object.keys(pcTasks).length;
    const summary = `Guardado exitosamente:\n- Auxiliar: ${auxiliar}\n- Turno: ${turno}\n- Fecha: ${formattedDate}\n- Computadoras con tareas: ${pcWithTasks}/40\n- Conclusiones: ${conclusiones.substring(
      0,
      50
    )}...`;
    alert("Informe guardado correctamente!\n\n" + summary);
  };

  // Descargar PDF
  const downloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.createElement("div");
    element.className = "pdf-container";
    element.style.padding = "20px";
    // Título
    const pdfTitle = document.createElement("h1");
    pdfTitle.textContent = "Informe LAB46 - Detalle Completo";
    pdfTitle.style.textAlign = "center";
    pdfTitle.style.marginBottom = "20px";
    pdfTitle.style.color = "#1a2a6c";
    element.appendChild(pdfTitle);
    // Info básica
    const infoSection = document.createElement("div");
    infoSection.innerHTML = `<div style='margin-bottom: 20px;'><strong>Auxiliar:</strong> ${auxiliar}<br><strong>Turno:</strong> ${turno}<br><strong>Fecha:</strong> ${fecha}</div>`;
    element.appendChild(infoSection);
    // Tabla de computadoras
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "20px";
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th style='border:1px solid #ddd;padding:8px;'>PC</th><th style='border:1px solid #ddd;padding:8px;'>Estado</th><th style='border:1px solid #ddd;padding:8px;'>Tareas</th></tr>`;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    for (let i = 1; i <= 40; i++) {
      const t = pcTasks[i] || { status: "none", tasks: [] };
      const tr = document.createElement("tr");
      tr.innerHTML = `<td style='border:1px solid #ddd;padding:8px;'>${i}</td><td style='border:1px solid #ddd;padding:8px;'>${STATUS[t.status as keyof typeof STATUS].label}</td><td style='border:1px solid #ddd;padding:8px;'>${
        t.tasks.length > 0 ? t.tasks.join("<br>") : "-"
      }</td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    element.appendChild(table);
    // Conclusiones
    const concl = document.createElement("div");
    concl.innerHTML = `<h2 style='border-bottom:2px solid #1a2a6c;padding-bottom:5px;margin-bottom:15px;'>Conclusiones</h2><div>${conclusiones}</div>`;
    element.appendChild(concl);
    html2pdf().from(element).save("informe-lab46.pdf");
  };

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [modalOpen]);

  // Footer con fecha actual
  const fechaFooter = (() => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()}`;
  })();

  return (
    <div className="container">
      <div className="header">
        <div className="logo">
          <div className="logo-circle">L46</div>
        </div>
        <h1>Informe LAB46</h1>
        <p>Sistema de gestión de reportes de laboratorio</p>
      </div>
      <div className="content">
        <table className="info-table">
          <tbody>
            <tr>
              <td>Auxiliar:</td>
              <td>
                <input
                  type="text"
                  className="editable-field"
                  value={auxiliar}
                  onChange={(e) => setAuxiliar(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Turno:</td>
              <td>
                <select
                  className="editable-field"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Fecha:</td>
              <td>
                <input
                  type="date"
                  className="editable-field"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {/* Sección de computadoras */}
        <div className="computers-section">
          <h2 className="section-title">Tareas por Computadora (LAB46)</h2>
          <p className="section-subtitle">
            Haga clic en una computadora para registrar las tareas realizadas
          </p>
          <div className="computers-grid">
            {Array.from({ length: 40 }, (_, i) => {
              const pcId = i + 1;
              const t = pcTasks[pcId] || { status: "none", tasks: [] };
              return (
                <div
                  key={pcId}
                  className="computer-card"
                  onClick={() => openModal(pcId)}
                  tabIndex={0}
                  style={{ outline: "none" }}
                >
                  <div className="computer-number">{pcId}</div>
                  <div className={`computer-status ${STATUS[t.status as keyof typeof STATUS].class}`}>
                    {STATUS[t.status as keyof typeof STATUS].label}
                  </div>
                  <div className="computer-task">
                    {t.tasks.length > 0
                      ? t.tasks[0].length > 20
                        ? t.tasks[0].slice(0, 20) + "..."
                        : t.tasks[0]
                      : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Estadísticas */}
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{stats.maintenance}</div>
            <div className="stat-label">En Mantenimiento</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{stats.problem}</div>
            <div className="stat-label">Con Problemas</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>
        <h2 className="section-title">Conclusiones:</h2>
        <textarea
          className="conclusiones-box"
          value={conclusiones}
          onChange={(e) => setConclusiones(e.target.value)}
        />
        <div className="btn-container">
          <button className="btn btn-save" onClick={saveReport}>
            <i className="fas fa-save"></i> Guardar Informe
          </button>
          <button className="btn btn-reset" onClick={resetAll}>
            <i className="fas fa-undo"></i> Restablecer
          </button>
          <button className="btn btn-pdf" onClick={downloadPDF}>
            <i className="fas fa-file-pdf"></i> Descargar PDF
          </button>
        </div>
      </div>
      <div className="footer">
        <p>
          Sistema de Informes LAB46 &copy; 2025 | Todos los derechos reservados |{" "}
          {fechaFooter}
        </p>
      </div>
      {/* Modal para editar tareas de computadoras */}
      {modalOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-content" ref={modalRef}>
            <span
              className="close"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </span>
            <h2 className="modal-title">
              Computadora #<span>{modalPcId}</span>
            </h2>
            <div className="status-selector">
              {Object.entries(STATUS).map(([key, val]) => (
                <div
                  key={key}
                  className={`status-option ${val.class} ${
                    modalStatus === key ? "selected" : ""
                  }`}
                  data-status={key}
                  onClick={() => setModalStatus(key as keyof typeof STATUS)}
                >
                  <i className={`fas ${val.icon}`}></i>
                  <p>{val.label}</p>
                </div>
              ))}
            </div>
            <h3>Tareas realizadas:</h3>
            <div className="task-list">
              {modalTasks.length === 0 ? (
                <div style={{ color: "#888" }}>Sin tareas registradas</div>
              ) : (
                modalTasks.map((task, idx) => (
                  <div className="task-list-item" key={idx}>
                    <span className="task-bullet">•</span>
                    <span className="task-text">{task}</span>
                    <span
                      className="remove-task"
                      title="Eliminar tarea"
                      onClick={() => setModalTasks((tasks) => tasks.filter((_, i) => i !== idx))}
                    >
                      <i className="fas fa-times"></i>
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="add-task-container">
              <input
                type="text"
                className="add-task-input"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Agregar nueva tarea..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTask.trim()) {
                    setModalTasks((tasks) => [...tasks, newTask.trim()]);
                    setNewTask("");
                  }
                }}
              />
              <button
                className="add-task-btn"
                onClick={() => {
                  if (newTask.trim()) {
                    setModalTasks((tasks) => [...tasks, newTask.trim()]);
                    setNewTask("");
                  }
                }}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <div className="btn-container">
              <button className="btn btn-save" onClick={saveModalTasks}>
                <i className="fas fa-save"></i> Guardar Tareas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
