#!/usr/bin/env python3
"""
Interfaz grafica para el Generador de Calendario de Disponibilidad.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generar_calendario import generate

MONTH_LABELS = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
}


class CalendarioGUI:
    def __init__(self, root):
        self.root = root
        root.title("Generador de Calendario de Disponibilidad")
        root.minsize(500, 520)
        root.geometry("560x600")

        main = ttk.Frame(root, padding=20)
        main.pack(fill=tk.BOTH, expand=True)

        # --- Year ---
        ttk.Label(main, text="Año:", font=("Segoe UI", 11, "bold")).pack(anchor=tk.W)
        self.year_var = tk.StringVar(value="2026")
        year_spin = ttk.Spinbox(
            main,
            from_=2024,
            to=2035,
            textvariable=self.year_var,
            width=10,
            font=("Segoe UI", 11),
        )
        year_spin.pack(anchor=tk.W, pady=(0, 15))

        # --- Months ---
        # --- Group Name ---
        ttk.Label(main, text="Nombre del grupo:", font=("Segoe UI", 11, "bold")).pack(
            anchor=tk.W
        )
        self.group_var = tk.StringVar()
        group_entry = ttk.Entry(
            main, textvariable=self.group_var, font=("Segoe UI", 11)
        )
        group_entry.pack(fill=tk.X, pady=(0, 15))

        # --- Months ---
        ttk.Label(main, text="Meses:", font=("Segoe UI", 11, "bold")).pack(anchor=tk.W)
        months_frame = ttk.Frame(main)
        months_frame.pack(fill=tk.X, pady=(4, 15))
        self.month_vars = {}
        row, col = 0, 0
        for m in range(1, 13):
            v = tk.BooleanVar()
            self.month_vars[m] = v
            cb = ttk.Checkbutton(months_frame, text=MONTH_LABELS[m][:3], variable=v)
            cb.grid(row=row, column=col, sticky=tk.W, padx=(0, 8))
            col += 1
            if col == 4:
                col = 0
                row += 1

        # --- People ---
        ttk.Label(main, text="Personas:", font=("Segoe UI", 11, "bold")).pack(
            anchor=tk.W
        )
        people_frame = ttk.Frame(main)
        people_frame.pack(fill=tk.BOTH, expand=True, pady=(4, 15))

        list_frame = ttk.Frame(people_frame)
        list_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scroll = ttk.Scrollbar(list_frame, orient=tk.VERTICAL)
        self.people_listbox = tk.Listbox(
            list_frame,
            selectmode=tk.EXTENDED,
            yscrollcommand=scroll.set,
            font=("Segoe UI", 11),
            activestyle="none",
        )
        scroll.config(command=self.people_listbox.yview)
        scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.people_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        btn_frame = ttk.Frame(people_frame)
        btn_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=(10, 0))

        self.entry_var = tk.StringVar()
        self.name_entry = ttk.Entry(
            btn_frame, textvariable=self.entry_var, font=("Segoe UI", 11)
        )
        self.name_entry.pack(fill=tk.X)
        self.name_entry.bind("<Return>", lambda e: self.add_person())

        ttk.Button(btn_frame, text="Añadir", command=self.add_person).pack(
            fill=tk.X, pady=(4, 4)
        )
        ttk.Button(btn_frame, text="Eliminar", command=self.remove_person).pack(
            fill=tk.X
        )

        # --- Generate ---
        self.gen_btn = ttk.Button(
            main, text="Generar Calendario", command=self.generate
        )
        self.gen_btn.pack(pady=(0, 8))

        self.status_var = tk.StringVar()
        self.status_label = ttk.Label(
            main,
            textvariable=self.status_var,
            font=("Segoe UI", 10),
            foreground="#555",
            wraplength=500,
        )
        self.status_label.pack(fill=tk.X)

        self.progress = ttk.Progressbar(main, mode="indeterminate")
        self.progress.pack(fill=tk.X, pady=(4, 0))

        root.protocol("WM_DELETE_WINDOW", self.on_closing)

        # Center window
        root.update_idletasks()
        w = root.winfo_width()
        h = root.winfo_height()
        sw = root.winfo_screenwidth()
        sh = root.winfo_screenheight()
        root.geometry(f"+{(sw - w) // 2}+{(sh - h) // 2}")

    def on_closing(self):
        self.progress.stop()
        self.root.destroy()

    def add_person(self):
        name = self.entry_var.get().strip().upper()
        if not name:
            return
        existing = self.people_listbox.get(0, tk.END)
        if name in existing:
            self.status_var.set(f"'{name}' ya esta en la lista")
            return
        self.people_listbox.insert(tk.END, name)
        self.entry_var.set("")
        self.name_entry.focus()
        self.status_var.set("")

    def remove_person(self):
        selected = self.people_listbox.curselection()
        if not selected:
            self.status_var.set("Selecciona una o mas personas para eliminar")
            return
        for i in reversed(selected):
            self.people_listbox.delete(i)
        self.status_var.set("")

    def generate(self):
        # Validate year
        try:
            year = int(self.year_var.get())
        except ValueError:
            messagebox.showerror("Error", "El año debe ser un numero valido")
            return
        if year < 2024 or year > 2035:
            messagebox.showerror("Error", "El año debe estar entre 2024 y 2035")
            return

        # Validate group name
        group_name = self.group_var.get().strip()
        if not group_name:
            messagebox.showerror("Error", "Escribe un nombre para el grupo")
            return

        # Validate months
        months = sorted([m for m, v in self.month_vars.items() if v.get()])
        if not months:
            messagebox.showerror("Error", "Selecciona al menos un mes")
            return
        month_names = {m: MONTH_LABELS[m].upper() for m in months}

        # Validate people
        people = list(self.people_listbox.get(0, tk.END))
        if not people:
            messagebox.showerror("Error", "Añade al menos una persona")
            return

        # Disable button and show progress
        self.gen_btn.config(state=tk.DISABLED)
        self.progress.start(15)
        self.status_var.set("Generando...")
        self.root.update()

        def task():
            try:
                generate(year, months, month_names, people, group_name)
                self.root.after(
                    0, self.on_success, year, months, month_names, group_name
                )
            except Exception as e:
                self.root.after(0, self.on_error, str(e))

        threading.Thread(target=task, daemon=True).start()

    def on_success(self, year, months, month_names, group_name):
        self.progress.stop()
        self.gen_btn.config(state=tk.NORMAL)
        first = month_names[months[0]].lower()
        last = month_names[months[-1]].lower()
        slug = group_name.replace(" ", "_")
        filename = f"calendario_{first}-{last}_{slug}_{year}.xlsx"
        self.status_var.set(
            f"OK — {filename} generado\n"
            f"{len(months)} meses | {self.people_listbox.size()} personas"
        )

    def on_error(self, msg):
        self.progress.stop()
        self.gen_btn.config(state=tk.NORMAL)
        self.status_var.set(f"Error: {msg}")
        messagebox.showerror("Error", msg)


if __name__ == "__main__":
    root = tk.Tk()
    CalendarioGUI(root)
    root.mainloop()
