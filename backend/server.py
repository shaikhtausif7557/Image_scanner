from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from PIL import Image
import pytesseract
import cv2
from pyzbar.pyzbar import decode

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory to save uploaded images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure the app to use the upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload', methods=['POST','GET'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Save the file to the upload folder
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        # Perform OCR and barcode/QR code scanning
        try:
            text = extract_text_from_image(file_path)
            barcodes = scan_barcodes(file_path)
            return jsonify({
                'message': 'File uploaded and processed successfully',
                'text': text,
                'barcodes': barcodes
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

def extract_text_from_image(image_path):
    # Open the image file
    with Image.open(image_path) as img:
        # Use pytesseract to do OCR on the image
        text = pytesseract.image_to_string(img)
    return text

def scan_barcodes(image_path):
    # Read the image using OpenCV
    image = cv2.imread(image_path)
    # Decode the barcodes and QR codes
    decoded_objects = decode(image)
    # Extract data from decoded objects
    barcodes = [{'type': obj.type, 'data': obj.data.decode('utf-8')} for obj in decoded_objects]
    return barcodes

if __name__ == '__main__':
    app.run(debug=True)