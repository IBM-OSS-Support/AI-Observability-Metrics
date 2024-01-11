from flask import Flask, request, send_file, make_response
import paramiko
import io
import os
import zipfile
import gzip
import time
import random

app = Flask(__name__)


@app.route('/signals', methods=['POST'])
def upload():
    # Get the zip file data from the request body
    #zip_file = request.files['zip_file']
    zip_file_data = request.data

    # Set up the SSH client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    # Connect to the remote server 
    ssh.connect('9.20.196.62', username='root', password='Langchain!12345')
    #ssh.connect('9.30.51.154', username='root', password='Vijay!Trustgood1')


    sftp = ssh.open_sftp()
    zip_file_d = io.BytesIO(zip_file_data)

    id = random.randint(0, 10)
    file_path = "/home/test"
    file_name = f"dummy_new_{id}.gzip"

    # Check if the original file already exists
    complete_filepath = os.path.join(file_path, file_name)
    print(complete_filepath)

    
    #print(f"<<<<<<<< path : {os.path.normpath(complete_filepath)} >>>>>>")
    print(complete_filepath )
   # sftp.putfo(zip_file_d, os.path.normpath(file_path))
    
    with ssh.open_sftp() as sftp:
        # Upload the zip file to the remote server
        sftp.putfo(zip_file_d, complete_filepath)
 
    ssh.close()
    zip_file_d.seek(0)

    # Create a response object
    response = make_response(zip_file_d.getvalue())

    # Add headers to the response
    response.headers['Content-Disposition'] = f'attachment; filename={file_name}'
    response.headers['Content-Type'] = 'application/zip'
    response.headers['Content-Encoding'] = 'gzip'

    return response
 
    #return send_file(zip_file_d, download_name='dummy.gzip', as_attachment=True, mimetype="application/gzip")




if __name__ == '__main__':
    app.run()