document.addEventListener("DOMContentLoaded", function() {
    const usersList = document.getElementById('usersList');
    
    // Fetch and display users (Read)
    function fetchUsers() {
        fetch('https://reqres.in/api/users?page=1')
            .then(response => response.json())
            .then(data => {
                usersList.innerHTML = ''; // Clear the list before adding users
                data.data.forEach(user => {
                    addUserToList(user.id, `${user.first_name} ${user.last_name}`, user.email);
                });
            });
    }

    // Utility function to add user to the DOM
    function addUserToList(id, name, email) {
        const li = document.createElement('li');
        li.setAttribute('id', `user-${id}`);
        li.innerHTML = `ID: ${id}, Name: ${name}, Email: ${email}`;
        usersList.appendChild(li);
    }

    // Load users on page load
    fetchUsers();

    // Create User
    document.getElementById('createUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('createName').value;
        const job = document.getElementById('createJob').value;

        fetch('https://reqres.in/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, job })
        })
        .then(response => response.json())
        .then(data => {
            addUserToList(data.id, data.name, job); // Add new user to the list
            document.getElementById('createUserForm').reset(); // Clear form
        });
    });

    // Update User
    document.getElementById('updateUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('updateId').value;
        const name = document.getElementById('updateName').value;
        const job = document.getElementById('updateJob').value;

        fetch(`https://reqres.in/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, job })
        })
        .then(response => response.json())
        .then(data => {
            const userElement = document.getElementById(`user-${id}`);
            if (userElement) {
                userElement.innerHTML = `ID: ${id}, Name: ${data.name}, Email: ${data.job}`; // Update the UI
            }
            document.getElementById('updateUserForm').reset(); // Clear form
        });
    });

    // Delete User
    document.getElementById('deleteUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const id = document.getElementById('deleteId').value;

        fetch(`https://reqres.in/api/users/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.status === 204) {
                const userElement = document.getElementById(`user-${id}`);
                if (userElement) {
                    userElement.remove(); // Remove the user from the list
                }
                document.getElementById('deleteUserForm').reset(); // Clear form
            } else {
                console.error('Failed to delete the user');
            }
        });
    });
});
