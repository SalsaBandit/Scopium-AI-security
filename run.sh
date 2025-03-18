#script to run the dashboard incase user is on MacOS to run open terminal and write ./run.sh
#uncomment the below line to enable logging output once server starts
#set -x
cd backend
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver &
cd ../frontend
npm start