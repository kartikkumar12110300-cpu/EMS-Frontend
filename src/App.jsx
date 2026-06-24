import { useEffect, useMemo, useState } from "react";

function App() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    salary: "",
  });

  const API_URL = "http://localhost:4500/employees";

  // FETCH EMPLOYEES
  const getEmployees = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setEmployees(data);
  };

  useEffect(() => {
    getEmployees();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ADD EMPLOYEE
  const addEmployee = async (e) => {
    e.preventDefault();

    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setFormData({
      name: "",
      department: "",
      salary: "",
    });

    getEmployees();
  };

  // DELETE EMPLOYEE
  const deleteEmployee = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    getEmployees();
  };

  // EDIT EMPLOYEE
  const openEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name ?? "",
      department: employee.department ?? "",
      salary: employee.salary ?? "",
    });
  };

  const cancelEdit = () => {
    setSelectedEmployee(null);
    setFormData({ name: "", department: "", salary: "" });
  };

  const updateEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    await fetch(`${API_URL}/${selectedEmployee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setSelectedEmployee(null);
    setFormData({ name: "", department: "", salary: "" });
    getEmployees();
  };

  // FILTER + COUNT
  const departments = useMemo(() => {
    const set = new Set(employees.map((emp) => emp.department).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return employees.filter((emp) => {
      const matchesDepartment =
        departmentFilter === "all" ? true : emp.department === departmentFilter;

      const matchesSearch =
        term.length === 0
          ? true
          : String(emp.name ?? "").toLowerCase().includes(term) ||
            String(emp.department ?? "").toLowerCase().includes(term);

      return matchesDepartment && matchesSearch;
    });
  }, [employees, searchTerm, departmentFilter]);

  return (
    <div>
      <div className="controls">
        <input
          type="text"
          placeholder="Search Employee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "all" ? "All Departments" : d}
            </option>
          ))}
        </select>

        <div className="count">Employee count: {filteredEmployees.length}</div>
      </div>

      {selectedEmployee ? (
        <form onSubmit={updateEmployee} className="form">
          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />

          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
          />

          <button type="submit">Update Employee</button>
          <button type="button" onClick={cancelEdit} className="delete-btn">
            Cancel
          </button>
        </form>
      ) : (
        <form onSubmit={addEmployee} className="form">
          <input
            type="text"
            name="name"
            placeholder="Employee Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />

          <input
            type="number"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
          />

          <button type="submit">Add Employee</button>
        </form>
      )}

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
              style={{ marginTop: 10 }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

