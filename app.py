import os
import logging
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import DeclarativeBase
from forms import ContactForm, LoginForm

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# logging
logging.basicConfig(level=logging.DEBUG)
logger = app.logger

# Database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///portfolio.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')
app.config['ADMIN_EMAIL'] = os.environ.get('ADMIN_EMAIL')

# extensions
db.init_app(app)
mail = Mail(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'admin_login'

from models import User, Project, Experience, Service

@login_manager.user_loader
def load_user(user_id):
    try:
        return User.query.get(int(user_id))
    except Exception as e:
        logger.error(f"Error loading user: {e}")
        return None

# Database initialization and migration
def init_db():
    try:
        with app.app_context():
            logger.info("Starting database initialization...")
            # Create all tables
            db.create_all()
            logger.info("Tables created successfully")

            # if admin exists
            if not User.query.filter_by(username='admin').first():
                logger.info("Creating admin user...")
                admin = User(
                    username='admin',
                    email='admin@example.com',
                    password_hash=generate_password_hash('admin123')
                )
                db.session.add(admin)
                db.session.commit()
                logger.info("Admin user created successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

# Routes
@app.route('/')
def index():
    try:
        form = ContactForm()
        projects = Project.query.all()
        experiences = Experience.query.all()
        services = Service.query.all()
        return render_template('index.html', 
                           form=form,
                           projects=projects,
                           experiences=experiences,
                           services=services)
    except Exception as e:
        logger.error(f"Error in index route: {e}")
        flash('An error occurred while loading the page.', 'danger')
        return render_template('index.html', form=ContactForm())

@app.route('/contact', methods=['POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        try:
            msg = Message('New Contact Form Submission',
                         sender=app.config['MAIL_DEFAULT_SENDER'],
                         recipients=[app.config['ADMIN_EMAIL']])
            msg.body = f"""
            From: {form.name.data}
            Email: {form.email.data}
            Message: {form.message.data}
            """
            mail.send(msg)
            flash('Thank you! Your message has been sent successfully.', 'success')
            app.logger.info(f"Contact form submission successful from {form.email.data}")
        except Exception as e:
            app.logger.error(f"Failed to send contact form email: {str(e)}")
            flash('Sorry, there was an error sending your message. Please try again later.', 'danger')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'danger')
                app.logger.warning(f"Contact form validation error - {field}: {error}")

    return redirect(url_for('index', _anchor='contact'))

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    try:
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(username=form.username.data).first()
            if user and check_password_hash(user.password_hash, form.password.data):
                login_user(user)
                flash('Login successful!', 'success')
                return redirect(url_for('admin_dashboard'))
            flash('Invalid username or password', 'danger')
        return render_template('admin/login.html', form=form)
    except Exception as e:
        logger.error(f"Error in admin_login route: {e}")
        flash('An error occurred during login.', 'danger')
        return render_template('admin/login.html', form=form)

@app.route('/admin/logout')
@login_required
def admin_logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    try:
        projects = Project.query.all()
        experiences = Experience.query.all()
        services = Service.query.all()
        return render_template('admin/dashboard.html',
                         projects=projects,
                         experiences=experiences,
                         services=services)
    except Exception as e:
        logger.error(f"Error in admin_dashboard route: {e}")
        flash('An error occurred while loading the dashboard.', 'danger')
        return redirect(url_for('index'))

@app.route('/api/project', methods=['POST'])
@login_required
def add_project():
    try:
        data = request.json
        logger.debug(f"Received project data: {data}")
        project = Project(
            title=data['title'],
            description=data['description'],
            image_url=data['image_url'],
            project_url=data.get('project_url')
        )
        db.session.add(project)
        db.session.commit()
        logger.info(f"Project added successfully: {project.title}")
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error adding project: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/project/<int:id>', methods=['PUT', 'DELETE'])
@login_required
def manage_project(id):
    try:
        project = Project.query.get_or_404(id)
        if request.method == 'DELETE':
            db.session.delete(project)
            db.session.commit()
            logger.info(f"Project deleted successfully: {project.title}")
            return jsonify({'success': True})

        data = request.json
        project.title = data['title']
        project.description = data['description']
        project.image_url = data['image_url']
        project.project_url = data.get('project_url')
        db.session.commit()
        logger.info(f"Project updated successfully: {project.title}")
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error managing project: {e}")
        return jsonify({'error': str(e)}), 500


# Initialize db
init_db()