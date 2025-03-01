# Portfolio Website

This is a simple portfolio website built with Flask framework with administrator dashboard for content management.

![Ss]()

## Built With
- **Backend**: Flask (Python web framework)
- **Database**: SQLAlchemy ORM with SQLite (local development) and PostgreSQL support (production)
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Flask-Login for secure admin access
- **Forms**: Flask-WTF for form validation and processing
- **CSS Features**: Custom animations, responsive grid layout, and mobile-first design

## Project Structure
- **Models**: User, Project, Experience, and Service classes
- **Forms**: Contact and authentication forms with validation
- **Routes**: Public-facing portfolio and admin-only dashboard
- **Templates**: Jinja2 templates with a modular approach (base layout + content sections)

## Getting Started
1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run the application: `gunicorn --bind 0.0.0.0:5000 main:app`
4. Access the website at `http://0.0.0.0:5000`
5. Admin login at `/admin/login` (default credentials: admin/admin123)

## Deployment
The application is configured to run with Gunicorn for production deployment on Replit.

## License
This project is licensed under the MIT License.
