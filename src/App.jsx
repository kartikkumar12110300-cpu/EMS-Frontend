import { useEffect, useMemo, useState } from "react";

// const API_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://ems-backend-9n7x.onrender.com/employees";


const API_URL = "http://localhost:4500/employees";



function App() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    salary: "",
  });

  const getEmployees = async () => {
    setError("");

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Unable to load employees.");
      setEmployees(await response.json());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setFormData({ name: "", department: "", salary: "" });
  };

  const employeePayload = () => ({
    name: formData.name.trim(),
    department: formData.department.trim(),
    salary: Number(formData.salary),
  });

  const addEmployee = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeePayload()),
      });
      if (!response.ok) throw new Error("Unable to add employee.");
      resetForm();
      await getEmployees();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteEmployee = async (_id) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${_id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to delete employee.");
      await getEmployees();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name ?? "",
      department: employee.department ?? "",
      salary: employee.salary ?? "",
    });
  };

  const updateEmployee = async (event) => {
    event.preventDefault();
    if (!selectedEmployee) return;
    setError("");

    try {
      const response = await fetch(`${API_URL}/${selectedEmployee._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeePayload()),
      });
      if (!response.ok) throw new Error("Unable to update employee.");
      resetForm();
      await getEmployees();
    } catch (requestError) {
      setError(requestError.message);
    }
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

      {error && <p className="status-message error-message">{error}</p>}

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

      {loading ? (
        <p className="status-message">Loading employees...</p>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map((employee) => (
            <div key={employee._id} className="card">
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
                onClick={() => deleteEmployee(employee._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default App;
