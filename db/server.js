import inquirer from 'inquirer';
import mysql from 'mysql2';
import cfonts from 'cfonts';

// Create a connection to MySQL server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "ONLYGODrise30$",
    database: "employeetracker_db" // Specify the database name
});

// Connect to MySQL server
connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL server");

    // Start the application after connecting to the server
    start();
});

// Function to start the application
function start() {
    // Prompt the user to select an action
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Add a Manager",
                "Update an employee role",
                "Exit",
            ],
        })
        .then((answer) => {
            // Display the welcome message after the prompt
            cfonts.say('Devin Haynes \nSQL Employee Tracker', {
                font: 'block',
                align: 'left',
                colors: ['blue'],
                background: 'transparent',
                letterSpacing: 1,
                lineHeight: 1,
                space: true,
                maxLength: '0',
                gradient: false,
                independentGradient: false,
                transitionGradient: false,
                env: 'node'
            });

            switch (answer.action) {
                case "View all departments":
                    viewAllDepartments();
                    break;
                case "View all roles":
                    viewAllRoles();
                    break;
                case "View all employees":
                    viewAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add a Manager":
                    addManager();
                    break;
                case "Update an employee role":
                    updateEmployeeRole();
                    break;
                case "Exit":
                    connection.end();
                    console.log("Goodbye!");
                    break;
            }
        });
}

// Function to view all departments
function viewAllDepartments() {
    const query = "SELECT * FROM employeetracker_db.departments";
    connection.query(query, (err, res) => {
        if (err) {
            console.error("Error:", err.message);
        } else {
            console.table(res);
        }
        // Restart the application
        start();
    });
}

// Function to view all roles
function viewAllRoles() {
    const query = "SELECT roles.title, roles.id, departments.department_name, roles.salary FROM employeetracker_db.roles JOIN employeetracker_db.departments ON roles.department_id = departments.id";
    connection.query(query, (err, res) => {
        if (err) {
            console.error("Error:", err.message);
        } else {
            console.table(res);
        }
        // Restart the application
        start();
    });
}

// Function to view all employees
function viewAllEmployees() {
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employeetracker_db.employee e
    LEFT JOIN employeetracker_db.roles r ON e.role_id = r.id
    LEFT JOIN employeetracker_db.departments d ON r.department_id = d.id
    LEFT JOIN employeetracker_db.employee m ON e.manager_id = m.id;
    `;
    connection.query(query, (err, res) => {
        if (err) {
            console.error("Error:", err.message);
        } else {
            console.table(res);
        }
        // Restart the application
        start();
    });
}

// Function to add a department
function addDepartment() {
    inquirer
        .prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the new department:",
        })
        .then((answer) => {
            const query = "INSERT INTO employeetracker_db.departments (department_name) VALUES (?)";
            connection.query(query, [answer.name], (err, res) => {
                if (err) {
                    console.error("Error:", err.message);
                } else {
                    console.log(`Added department ${answer.name} to the database!`);
                }
                // Restart the application
                start();
            });
        });
}

// Function to add a role
function addRole() {
    // Retrieve list of departments from the database
    connection.query("SELECT * FROM employeetracker_db.departments", (err, res) => {
        if (err) {
            console.error("Error:", err.message);
            start();
            return;
        }
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "title",
                    message: "Enter the title of the new role:",
                },
                {
                    type: "input",
                    name: "salary",
                    message: "Enter the salary of the new role:",
                },
                {
                    type: "list",
                    name: "department_id",
                    message: "Select the department for the new role:",
                    choices: res.map((department) => ({
                        name: department.department_name,
                        value: department.id,
                    })),
                },
            ])
            .then((answers) => {
                const query = "INSERT INTO employeetracker_db.roles (title, salary, department_id) VALUES (?, ?, ?)";
                connection.query(query, [answers.title, answers.salary, answers.department_id], (err, res) => {
                    if (err) {
                        console.error("Error:", err.message);
                    } else {
                        console.log(`Added role ${answers.title} with salary ${answers.salary} to the database!`);
                    }
                    // Restart the application
                    start();
                });
            });
    });
}

// Function to add an employee
function addEmployee() {
    // Retrieve list of roles from the database
    connection.query("SELECT * FROM employeetracker_db.roles", (err, resRoles) => {
        if (err) {
            console.error("Error:", err.message);
            start();
            return;
        }
        // Retrieve list of employees from the database to use as managers
        connection.query("SELECT * FROM employeetracker_db.employee", (err, resEmployee) => {
            if (err) {
                console.error("Error:", err.message);
                start();
                return;
            }
            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "firstName",
                        message: "Enter the employee's first name:",
                    },
                    {
                        type: "input",
                        name: "lastName",
                        message: "Enter the employee's last name:",
                    },
                    {
                        type: "list",
                        name: "roleId",
                        message: "Select the employee role:",
                        choices: resRoles.map((role) => ({
                            name: role.title,
                            value: role.id,
                        })),
                    },
                    {
                        type: "list",
                        name: "managerId",
                        message: "Select the employee manager:",
                        choices: [
                            { name: "None", value: null },
                            ...resEmployees.map((employee) => ({
                                name: `${employee.first_name} ${employee.last_name}`,
                                value: employee.id,
                            })),
                        ],
                    },
                ])
                .then((answers) => {
                    const query = "INSERT INTO employeetracker_db.employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                    connection.query(query, [answers.firstName, answers.lastName, answers.roleId, answers.managerId], (err, res) => {
                        if (err) {
                            console.error("Error:", err.message);
                        } else {
                            console.log("Employee added successfully");
                        }
                        // Restart the application
                        start();
                    });
                });
        });
    });
}

// Function to add a Manager
function addManager() {
    // Retrieve list of departments from the database
    connection.query("SELECT * FROM employeetracker_db.departments", (err, resDepartments) => {
        if (err) {
            console.error("Error:", err.message);
            start();
            return;
        }
        // Retrieve list of employees from the database
        connection.query("SELECT * FROM employeetracker_db.employee", (err, resEmployees) => {
            if (err) {
                console.error("Error:", err.message);
                start();
                return;
            }
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "departmentId",
                        message: "Select the department for the manager:",
                        choices: resDepartments.map((department) => ({
                            name: department.department_name,
                            value: department.id,
                        })),
                    },
                    {
                        type: "list",
                        name: "employeeId",
                        message: "Select the employee to promote as manager:",
                        choices: resEmployees.map((employee) => ({
                            name: `${employee.first_name} ${employee.last_name}`,
                            value: employee.id,
                        })),
                    },
                ])
                .then((answers) => {
                    const query = "UPDATE employeetracker_db.employee SET is_manager = 1 WHERE id = ?";
                    connection.query(query, [answers.employeeId], (err, res) => {
                        if (err) {
                            console.error("Error:", err.message);
                        } else {
                            console.log(`Employee ${answers.employeeId} is promoted as manager in department ${answers.departmentId}`);
                        }
                        // Restart the application
                        start();
                    });
                });
        });
    });
}

// Function to update an employee role
function updateEmployeeRole() {
    // Retrieve list of employees from the database
    connection.query("SELECT * FROM employeetracker_db.employee", (err, resEmployees) => {
        if (err) {
            console.error("Error:", err.message);
            start();
            return;
        }
        // Retrieve list of roles from the database
        connection.query("SELECT * FROM employeetracker_db.roles", (err, resRoles) => {
            if (err) {
                console.error("Error:", err.message);
                start();
                return;
            }
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employeeId",
                        message: "Select the employee to update role:",
                        choices: resEmployees.map((employee) => ({
                            name: `${employee.first_name} ${employee.last_name}`,
                            value: employee.id,
                        })),
                    },
                    {
                        type: "list",
                        name: "roleId",
                        message: "Select the new role for the employee:",
                        choices: resRoles.map((role) => ({
                            name: role.title,
                            value: role.id,
                        })),
                    },
                ])
                .then((answers) => {
                    const query = "UPDATE employeetracker_db.employee SET role_id = ? WHERE id = ?";
                    connection.query(query, [answers.roleId, answers.employeeId], (err, res) => {
                        if (err) {
                            console.error("Error:", err.message);
                        } else {
                            console.log(`Employee ${answers.employeeId} role updated successfully`);
                        }
                        // Restart the application
                        start();
                    });
                });
        });
    });
}

