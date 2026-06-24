import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ems-employees";
const defaultEmployees = [
  { id: 1, name: "Rahul", department: "IT", salary: 50000 },
  { id: 2, name: "Priya", department: "HR", salary: 40000 },
];

const loadEmployees = () => {
  try {
    const savedEmployees = localStorage.getItem(STORAGE_KEY);
    return savedEmployees ? JSON.parse(savedEmployees) : defaultEmployees;
  } catch {
    return defaultEmployees;
  }
};

function App() {
  const [employees, setEmployees] = useState(loadEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    salary: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  }, [employees]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setFormData({ name: "", department: "", salary: "" });
  };

  const addEmployee = (event) => {
    event.preventDefault();
    const nextId =
      employees.length === 0
        ? 1
        : Math.max(...employees.map((employee) => employee.id)) + 1;

    setEmployees([
      ...employees,
      {
        id: nextId,
        name: formData.name.trim(),
        department: formData.department.trim(),
        salary: Number(formData.salary),
      },
    ]);
    resetForm();
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter((employee) => employee.id !== id));
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name ?? "",
      department: employee.department ?? "",
      salary: employee.salary ?? "",
    });
  };

  const updateEmployee = (event) => {
    event.preventDefault();
    if (!selectedEmployee) return;

    setEmployees(
      employees.map((employee) =>
        employee.id === selectedEmployee.id
          ? {
              ...employee,
              name: formData.name.trim(),
              department: formData.department.trim(),
              salary: Number(formData.salary),
            }
          : employee,
      ),
    );
    resetForm();
  };

  const departments = useMemo(() => {
    const values = new Set(
      employees.map((employee) => employee.department).filter(Boolean),
    );
    return ["all", ...values];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesDepartment =
        departmentFilter === "all" ||
        employee.department === departmentFilter;
      const matchesSearch =
        !term ||
        String(employee.name).toLowerCase().includes(term) ||
        String(employee.department).toLowerCase().includes(term);

      return matchesDepartment && matchesSearch;
    });
  }, [employees, searchTerm, departmentFilter]);

  return (
    <main className="container">
      <h1>Employee Management System</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search Employee..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          {departments.map((department) => (
            <option key={department} value={department}>
              {department === "all" ? "All Departments" : department}
            </option>
          ))}
        </select>

        <div className="count">
          Employee count: {filteredEmployees.length}
        </div>
      </div>

      <form
        onSubmit={selectedEmployee ? updateEmployee : addEmployee}
        className="form"
      >
        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          min="0"
          required
        />
        <button type="submit">
          {selectedEmployee ? "Update Employee" : "Add Employee"}
        </button>
        {selectedEmployee && (
          <button type="button" onClick={resetForm} className="delete-btn">
            Cancel
          </button>
        )}
      </form>

      <div className="employee-grid">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="card">
            <h3>{employee.name}</h3>
            <p>Department: {employee.department}</p>
            <p>Salary: ₹{employee.salary}</p>
            <button
              className="delete-btn"
              onClick={() => openEdit(employee)}
              style={{ background: "#2563eb" }}
            >
              Edit
            </button>
            <button
              className="delete-btn"
              onClick={() => deleteEmployee(employee.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
