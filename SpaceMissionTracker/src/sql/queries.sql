/* Since Oracle does not support ON UPDATED, we will manually cascade changes where needed depending on the comments for each relation.*/

-- CREATE STATEMENTS

-- If equipment_serial_num updated: need to update in Carries
CREATE TABLE Equipment
(equipment_serial_num VARCHAR(30) PRIMARY KEY, 
equipment_name VARCHAR(100), 
eq_type VARCHAR(30));

-- If site_id updated: need to update in Mission
CREATE TABLE LaunchSite
(site_id VARCHAR(30) PRIMARY KEY, 
site_name VARCHAR(50) UNIQUE,
site_city VARCHAR(50),
site_country VARCHAR(30));

-- If body_id updated: need to update in Mission
CREATE TABLE CelestialBody
(body_id VARCHAR(30) PRIMARY KEY, 
name VARCHAR(100), 
cb_type VARCHAR(30),
has_atmosphere BOOLEAN);

-- If model_name, manufacturer updated: need to update in Spacecraft
CREATE TABLE SpacecraftModel
(model_name VARCHAR(50), 
manufacturer VARCHAR(30), 
sc_type VARCHAR(10), 
crew_capacity INTEGER, 
cargo_capacity_kg DECIMAL(8,2),
PRIMARY KEY (manufacturer, model_name));

-- If agency_id updated: need to update in ParticipateIn
-- all agencies must have names but may not have acronyms, agency_id self-assigned to avoid duplication (mismatch names)
CREATE TABLE Agency
(agency_id INTEGER PRIMARY KEY, 
agency_name VARCHAR(100) UNIQUE NOT NULL, 
acronym VARCHAR(10) UNIQUE,
agency_location VARCHAR(100), 
agency_city VARCHAR(30), 
agency_country VARCHAR(30));

-- If astronaut_id updated: need to update in Pilot, Engineer, Researcher, AssignedTo, TrainedIn
-- nationality = ISO country codes - usually 2-3 characters but max of 5 to be safe
CREATE TABLE Astronaut
(astronaut_id INTEGER PRIMARY KEY,
astronaut_name VARCHAR(50),
nationality VARCHAR(5),
dob DATE);
	
-- If program_name, program_location is updated: need to update in TrainedIn
CREATE TABLE TrainingProgram
(program_name VARCHAR(50),
program_location VARCHAR(100),
tp_type VARCHAR(50) NOT NULL,
PRIMARY KEY (program_name, program_location));

-- If model_name, manufacturer is updated in SpacecraftModel -> Spacecraft is updated
-- If spacecraft_id updated: need to update in Mission, Carries
CREATE TABLE Spacecraft
(spacecraft_id VARCHAR(30) PRIMARY KEY,
model_name VARCHAR(50) NOT NULL, 
manufacturer VARCHAR(30) NOT NULL, 
FOREIGN KEY (model_name, manufacturer) REFERENCES SpacecraftModel);

-- If site_id is updated in LaunchSite -> Mission is updated
-- If body_id is updated in CelestialBody -> Mission is updated
-- If spacecraft_id is updated in Spacecraft -> Mission is updated
-- If mission_id updated: need to update in MissionLog, Carries, ParticipateIn, AssignedTo
CREATE TABLE Mission
(mission_id VARCHAR(30) PRIMARY KEY, 
site_id VARCHAR(30) NOT NULL, 
body_id VARCHAR(30) NOT NULL,
spacecraft_id VARCHAR(30) NOT NULL,
spacecraft_name VARCHAR(30),
mission_name VARCHAR(100),
start_date DATE,
end_date DATE,
launch_date DATE,
FOREIGN KEY (site_id) REFERENCES LaunchSite,
FOREIGN KEY (body_id) REFERENCES CelestialBody,
FOREIGN KEY (spacecraft_id) REFERENCES Spacecraft);

-- If mission_id is updated in Mission -> MissionLog is updated
CREATE TABLE MissionLog
(log_date DATE, 
mission_id VARCHAR(30), 
entry_type VARCHAR(100),
status VARCHAR(100),
description VARCHAR(100),
PRIMARY KEY (log_date, mission_id),
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE);

-- If mission_id is updated in Mission -> Carries is updated
-- If spacecraft_id is updated in Spacecraft -> Carries is updated
-- If equipment_serial_num is updated in Equipment -> Carries is updated
-- this table requires assertions since each spacecraft used by a mission must carry at least one piece of equipment
CREATE TABLE Carries
(spacecraft_id VARCHAR(30),
mission_id VARCHAR(30),
equipment_serial_num VARCHAR(30), 
PRIMARY KEY (spacecraft_id, mission_id, equipment_serial_num), 
FOREIGN KEY (spacecraft_id) REFERENCES Spacecraft
ON DELETE CASCADE, 
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE, 
FOREIGN KEY (equipment_serial_num) REFERENCES Equipment
ON DELETE CASCADE);

-- If agency_id is updated in Agency -> ParticipateIn is updated
-- If mission_id is updated in Mission -> ParticipateIn is updated
-- this table requires assertions since each mission must have at least one agency
CREATE TABLE ParticipateIn
(agency_id INTEGER, 
mission_id VARCHAR(30),
role VARCHAR(50),
PRIMARY KEY (agency_id, mission_id), 
FOREIGN KEY (agency_id) REFERENCES Agency
ON DELETE CASCADE, 
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE);

	-- If astronaut_id is updated in Astronaut -> Pilot is updated
CREATE TABLE Pilot
(astronaut_id INTEGER PRIMARY KEY,
flight_hours DECIMAL(6,2),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> Engineer is updated
CREATE TABLE Engineer
(astronaut_id INTEGER PRIMARY KEY,
speciality VARCHAR(30),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> Researcher is updated
CREATE TABLE Researcher
(astronaut_id INTEGER PRIMARY KEY,
field VARCHAR(30),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> AssignedTo is updated
-- If mission_id is updated in Mission -> AssignedTo is updated
CREATE TABLE AssignedTo
(astronaut_id INTEGER,
mission_id VARCHAR(30),
PRIMARY KEY (astronaut_id, mission_id), 
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE, 
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> TrainedIn is updated
-- If program_name, program_location is updated in TrainingProgram -> TrainedIn is updated
-- this table requires assertions since each Astronaut must have trained in a training program and each training program must have at least one Astronaut enrolment
CREATE TABLE TrainedIn
(astronaut_id INTEGER,
program_name VARCHAR(50),
program_location VARCHAR(100),
PRIMARY KEY (astronaut_id, program_name, program_location),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE,
FOREIGN KEY (program_name, program_location) REFERENCES TrainingProgram
ON DELETE CASCADE);

-- INSERT STATEMENTS

