___
# RoadAid - Vehicle Emergency Assistance System

RoadAid is a comprehensive vehicle assistance platform designed for drivers facing unexpected issues on the road. Our system goes beyond traditional mechanic support by addressing common emergencies such as tire punctures, running out of fuel, and other roadside incidents. The platform allows users to quickly locate nearby mechanics, request services, and receive real-time ETAs for assistance, ensuring safety and minimizing delays during vehicle breakdowns.

## Features

- **Mechanic Support:** Connect with certified mechanics nearby for repairs and maintenance.  
- **Tire Puncture Assistance:** Fast help for tire-related emergencies.  
- **Fuel Delivery:** On-demand fuel delivery service for vehicles that run out of fuel.  
- **Service Request Tracking:** Users can monitor the status and estimated arrival of assistance.  
- **Emergency Logic:** Prioritization of critical incidents for faster response.  
- **User Authentication:** Secure login and account management.  

## Tech Stack

- **Frontend:** React.js  
- **Backend:**  Python/ Django  
- **Database:** SQLITEDB  
- **Maps & Location Services:** Google Maps API / Geolocation API

## Team

- **D.R.C.V.DISSANAYAKE** –Product Owner – e23084@eng.pdn.ac.lk  
- **M.M.M.A.NULAR** –Team Leader  – e23249@eng.pdn.ac.lk  
- **H.A.K.SENEVIRATHNE** –Project Collaborator  – e23369@eng.pdn.ac.lk  
- **T.W.S.ASEN** –Project Collaborator  – e23021@eng.pdn.ac.lk  


## Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/yourusername/RoadAid.git

## Running a local copy

This project uses a local SQLite database at `backend/db.sqlite3` when it is run
on your computer. That file contains the user accounts and their password
hashes. It is separate from the database on another developer's computer and
from the hosted application.

Start the backend in one terminal:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The development frontend is configured in `frontend/.env.local` to use
`http://127.0.0.1:8000`, so it logs in against *your* `backend/db.sqlite3`.

### Login accounts

Do not expect an account/password created in a teammate's local copy to work
in this copy. Passwords are stored as one-way hashes and cannot be recovered
from the SQLite database.

To use the same existing local accounts, obtain the matching `backend/db.sqlite3`
file from the teammate who owns those accounts (with their permission), then
replace this copy only while the backend is stopped. Otherwise, create a new
customer account through **Customer signup**. A newly created mechanic account
requires admin approval before it can log in.
