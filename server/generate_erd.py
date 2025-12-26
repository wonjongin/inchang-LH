from sqlalchemy_data_model_visualizer import generate_data_model_diagram
from models.models import User, Complex, Template, Vendor, Reservation

models = [User, Complex, Template, Vendor, Reservation]
output_file_name = 'diagram_erd'
generate_data_model_diagram(models, output_file_name)
# add_web_font_and_interactivity(output_file_name + '.svg', output_file_name + '_interactive.svg')
