// index.js
const fs = require('fs').promises;
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(q) {
  return new Promise(resolve => rl.question(q, ans => resolve(ans.trim())));
}

let employees = [];
let nextId = 1;
const DATA_FILE = './employees.json';

async function loadFromFile() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    employees = JSON.parse(data);
    const maxId = employees.reduce((m, e) => Math.max(m, e.id || 0), 0);
    nextId = maxId + 1;
    console.log(`\nLoaded ${employees.length} employees from ${DATA_FILE}\n`);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Error loading file:', err.message);
  }
}

async function saveToFile() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(employees, null, 2));
    console.log('Saved to', DATA_FILE);
  } catch (err) {
    console.error('Error saving file:', err.message);
  }
}

function printEmployee(e) {
  console.log(`ID: ${e.id} | Name: ${e.name} | Age: ${e.age} | Role: ${e.role} | Dept: ${e.department} | Salary: ${e.salary}`);
}

async function addEmployee() {
  console.log('\nAdd new employee:');
  const name = await question('  Name: ');
  const ageStr = await question('  Age: ');
  const age = ageStr ? parseInt(ageStr) : null;
  const role = await question('  Role: ');
  const department = await question('  Department: ');
  const salaryStr = await question('  Salary: ');
  const salary = salaryStr ? parseFloat(salaryStr) : 0;

  const emp = { id: nextId++, name, age, role, department, salary };
  employees.push(emp);
  console.log('\nEmployee added:');
  printEmployee(emp);
  console.log('');
}

function listEmployees() {
  console.log('');
  if (employees.length === 0) {
    console.log('No employees found.\n');
    return;
  }
  console.log('All employees:');
  employees.forEach(printEmployee);
  console.log('');
}

async function updateEmployee() {
  const idStr = await question('\nEnter employee ID to update: ');
  const id = parseInt(idStr);
  const emp = employees.find(e => e.id === id);
  if (!emp) { console.log('Employee not found.\n'); return; }

  console.log('Leave blank to keep current value.');
  const name = await question(`  Name (${emp.name}): `) || emp.name;
  const ageInput = await question(`  Age (${emp.age}): `);
  const age = ageInput ? parseInt(ageInput) : emp.age;
  const role = await question(`  Role (${emp.role}): `) || emp.role;
  const department = await question(`  Department (${emp.department}): `) || emp.department;
  const salaryInput = await question(`  Salary (${emp.salary}): `);
  const salary = salaryInput ? parseFloat(salaryInput) : emp.salary;

  Object.assign(emp, { name, age, role, department, salary });
  console.log('\nUpdated employee:');
  printEmployee(emp);
  console.log('');
}

async function deleteEmployee() {
  const idStr = await question('\nEnter employee ID to delete: ');
  const id = parseInt(idStr);
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) { console.log('Employee not found.\n'); return; }
  const [removed] = employees.splice(index, 1);
  console.log('\nRemoved:');
  printEmployee(removed);
  console.log('');
}

async function searchEmployees() {
  const q = await question('\nSearch (name/role/department): ');
  const term = q.toLowerCase();
  const results = employees.filter(e =>
    (e.name && e.name.toLowerCase().includes(term)) ||
    (e.role && e.role.toLowerCase().includes(term)) ||
    (e.department && e.department.toLowerCase().includes(term))
  );
  console.log('');
  if (results.length === 0) {
    console.log('No matches found.\n');
  } else {
    results.forEach(printEmployee);
    console.log('');
  }
}

async function mainMenu() {
  const menu = `
Choose an option:
 1) Add Employee
 2) List Employees
 3) Update Employee
 4) Delete Employee
 5) Search Employees
 6) Save to file
 7) Load from file
 0) Exit
`;
  while (true) {
    console.log(menu);
    const choice = await question('Your choice: ');
    switch (choice.trim()) {
      case '1': await addEmployee(); break;
      case '2': listEmployees(); break;
      case '3': await updateEmployee(); break;
      case '4': await deleteEmployee(); break;
      case '5': await searchEmployees(); break;
      case '6': await saveToFile(); break;
      case '7': await loadFromFile(); break;
      case '0':
        const ans = await question('Save before exit? (y/n): ');
        if (ans.toLowerCase().startsWith('y')) await saveToFile();
        console.log('Bye!');
        rl.close();
        return;
      default:
        console.log('Invalid choice, try again.');
    }
  }
}

(async () => {
  await loadFromFile();
  await mainMenu();
})();
