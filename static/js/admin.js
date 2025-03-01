document.addEventListener('DOMContentLoaded', function() {
    // project management
    const projectForm = document.getElementById('projectForm');
    const projectsList = document.getElementById('projectsList');
    const modal = document.getElementById('editProjectModal');
    const editForm = document.getElementById('editProjectForm');

    // modal
    function openModal() {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                title: projectForm.title.value,
                description: projectForm.description.value,
                image_url: projectForm.image_url.value,
                project_url: projectForm.project_url.value
            };

            try {
                const response = await fetch('/api/project', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Project added successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification('Failed to add project', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('An error occurred', 'error');
            }
        });
    }

    const deleteProject = async (id) => {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/project/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    showNotification('Project deleted successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification('Failed to delete project', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('An error occurred', 'error');
            }
        }
    };

    // edit project / modal
    const editProject = (id) => {
        const project = document.querySelector(`#project-${id}`);
        document.getElementById('edit-project-id').value = id;
        document.getElementById('edit-title').value = project.dataset.title;
        document.getElementById('edit-description').value = project.dataset.description;
        document.getElementById('edit-image-url').value = project.dataset.imageUrl;
        document.getElementById('edit-project-url').value = project.dataset.projectUrl;
        openModal();
    };

    // edit form submission
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-project-id').value;

            const formData = {
                title: document.getElementById('edit-title').value,
                description: document.getElementById('edit-description').value,
                image_url: document.getElementById('edit-image-url').value,
                project_url: document.getElementById('edit-project-url').value
            };

            try {
                const response = await fetch(`/api/project/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    showNotification('Project updated successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification('Failed to update project', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('An error occurred', 'error');
            }
        });
    }

    document.querySelectorAll('.delete-project').forEach(button => {
        button.addEventListener('click', () => deleteProject(button.dataset.id));
    });

    document.querySelectorAll('.edit-project').forEach(button => {
        button.addEventListener('click', () => editProject(button.dataset.id));
    });

    // notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="alert-close" aria-label="Close"></button>
        `;
        document.querySelector('.container').insertAdjacentElement('afterbegin', notification);

        // auto-remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        notification.querySelector('.alert-close').addEventListener('click', () => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });
    }
});
