/* Since Oracle does not support ON UPDATED, we will manually cascade changes where needed depending on the comments for each relation.*/

-- CREATE STATEMENTS

-- If equipment_serial_num updated: need to update in Carries
-- Creates the table Equipment
CREATE TABLE Equipment
(equipment_serial_num VARCHAR(30) PRIMARY KEY, 
equipment_name VARCHAR(100), 
eq_type VARCHAR(30));

-- If site_id updated: need to update in Mission
-- Creates the table LaunchSite
CREATE TABLE LaunchSite
(site_id VARCHAR(30) PRIMARY KEY, 
site_name VARCHAR(50) UNIQUE,
site_city VARCHAR(50),
site_country VARCHAR(30));

-- If body_id updated: need to update in Mission
-- Creates the table CelestialBody
CREATE TABLE CelestialBody
(body_id VARCHAR(30) PRIMARY KEY, 
name VARCHAR(100), 
cb_type VARCHAR(30),
has_atmosphere NUMBER(1) CHECK (has_atmosphere IN (0,1)));

-- If model_name, manufacturer updated: need to update in Spacecraft
-- Creates the table SpacecraftModel
CREATE TABLE SpacecraftModel
(model_name VARCHAR(50), 
manufacturer VARCHAR(30), 
sc_type VARCHAR(10), 
crew_capacity INTEGER, 
cargo_capacity_kg DECIMAL(8,2),
PRIMARY KEY (model_name, manufacturer));

-- If agency_id updated: need to update in ParticipateIn
-- all agencies must have names but may not have acronyms, agency_id self-assigned to avoid duplication (mismatch names)
-- Creates the table Agency
CREATE TABLE Agency
(agency_id INTEGER PRIMARY KEY, 
agency_name VARCHAR(100) UNIQUE NOT NULL, 
acronym VARCHAR(10) UNIQUE,
agency_location VARCHAR(100), 
agency_city VARCHAR(30), 
agency_country VARCHAR(30));

-- If astronaut_id updated: need to update in Pilot, Engineer, Researcher, AssignedTo, TrainedIn
-- nationality = ISO country codes - usually 2-3 characters but max of 5 to be safe
-- Creates the table Astronaut
CREATE TABLE Astronaut
(astronaut_id INTEGER PRIMARY KEY,
astronaut_name VARCHAR(50),
nationality VARCHAR(5),
dob DATE);
	
-- If program_name, program_location is updated: need to update in TrainedIn
-- Creates the table TrainingProgram
CREATE TABLE TrainingProgram
(program_name VARCHAR(50),
program_location VARCHAR(100),
tp_type VARCHAR(50) NOT NULL,
PRIMARY KEY (program_name, program_location));

-- If model_name, manufacturer is updated in SpacecraftModel -> Spacecraft is updated
-- If spacecraft_id updated: need to update in Mission, Carries
-- Creates the table Spacecraft
CREATE TABLE Spacecraft
(spacecraft_id VARCHAR(30) PRIMARY KEY,
model_name VARCHAR(50) NOT NULL, 
manufacturer VARCHAR(30) NOT NULL, 
FOREIGN KEY (model_name, manufacturer) REFERENCES SpacecraftModel);

-- If site_id is updated in LaunchSite -> Mission is updated
-- If body_id is updated in CelestialBody -> Mission is updated
-- If spacecraft_id is updated in Spacecraft -> Mission is updated
-- If mission_id updated: need to update in MissionLog, Carries, ParticipateIn, AssignedTo
-- Creates the table Mission: central entity
CREATE TABLE Mission
(mission_id VARCHAR(30) PRIMARY KEY, 
site_id VARCHAR(30) NOT NULL, 
body_id VARCHAR(30) NOT NULL,
spacecraft_id VARCHAR(30) NOT NULL,
spacecraft_name VARCHAR(30),
mission_name VARCHAR(100),
start_date DATE NOT NULL,
end_date DATE NOT NULL,
launch_date DATE NOT NULL,
FOREIGN KEY (site_id) REFERENCES LaunchSite,
FOREIGN KEY (body_id) REFERENCES CelestialBody,
FOREIGN KEY (spacecraft_id) REFERENCES Spacecraft);

-- If mission_id is updated in Mission -> MissionLog is updated
-- Creates the table MissionLog: dependent on Mission
CREATE TABLE MissionLog
(log_date DATE NOT NULL, 
mission_id VARCHAR(30) NOT NULL, 
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
-- Creates the table Carries: Spacecraft used by a Mission Carries Equipment
CREATE TABLE Carries
(mission_id VARCHAR(30) NOT NULL,
equipment_serial_num VARCHAR(30) NOT NULL, 
PRIMARY KEY (mission_id, equipment_serial_num), 
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE, 
FOREIGN KEY (equipment_serial_num) REFERENCES Equipment
ON DELETE CASCADE);

-- If agency_id is updated in Agency -> ParticipateIn is updated
-- If mission_id is updated in Mission -> ParticipateIn is updated
-- this table requires assertions since each mission must have at least one agency
-- Creates the table ParticipateIn: Agency ParticipatesIn Mission
CREATE TABLE ParticipateIn
(agency_id INTEGER NOT NULL, 
mission_id VARCHAR(30) NOT NULL,
role VARCHAR(50),
PRIMARY KEY (agency_id, mission_id), 
FOREIGN KEY (agency_id) REFERENCES Agency
ON DELETE CASCADE, 
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> Pilot is updated
-- Creates the table Pilot: child entity of Astronaut
CREATE TABLE Pilot
(astronaut_id INTEGER PRIMARY KEY,
flight_hours DECIMAL(6,2),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> Engineer is updated
-- Creates the table Engineer: child entity of Astronaut
CREATE TABLE Engineer
(astronaut_id INTEGER PRIMARY KEY,
speciality VARCHAR(30),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> Researcher is updated
-- Creates the table Researcher: child entity of Astronaut
CREATE TABLE Researcher
(astronaut_id INTEGER PRIMARY KEY,
field VARCHAR(30),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> AssignedTo is updated
-- If mission_id is updated in Mission -> AssignedTo is updated
-- Creates the table AssignedTo: Astronaut AssignedTo Mission
CREATE TABLE AssignedTo
(astronaut_id INTEGER NOT NULL,
mission_id VARCHAR(30) NOT NULL,
PRIMARY KEY (astronaut_id, mission_id), 
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE, 
FOREIGN KEY (mission_id) REFERENCES Mission
ON DELETE CASCADE);

-- If astronaut_id is updated in Astronaut -> TrainedIn is updated
-- If program_name, program_location is updated in TrainingProgram -> TrainedIn is updated
-- this table requires assertions since each Astronaut must have trained in a training program and each training program must have at least one Astronaut enrolment
-- Creates the table TrainedIn: Astronaut TrainedIn TrainingProgram
CREATE TABLE TrainedIn
(astronaut_id INTEGER NOT NULL,
program_name VARCHAR(50) NOT NULL,
program_location VARCHAR(100) NOT NULL,
PRIMARY KEY (astronaut_id, program_name, program_location),
FOREIGN KEY (astronaut_id) REFERENCES Astronaut
ON DELETE CASCADE,
FOREIGN KEY (program_name, program_location) REFERENCES TrainingProgram
ON DELETE CASCADE);

-- INSERT STATEMENTS

-- Insert values into Equipment
INSERT INTO Equipment (equipment_serial_num, equipment_name, eq_type) VALUES 
('EQ001', 'Lunar Module Eagle', 'Lunar Lander');

INSERT INTO Equipment (equipment_serial_num, equipment_name, eq_type) VALUES 
('EQ002', 'Alice', 'Orbiter Instrument');

INSERT INTO Equipment (equipment_serial_num, equipment_name, eq_type) VALUES 
('EQ003', 'CONSERT', 'Orbiter Instrument');

-- Insert values into LaunchSite
INSERT INTO LaunchSite (site_id, site_name, site_city, site_country) VALUES 
('LS001', 'Kennedy Space Center', 'Florida', 'USA');

INSERT INTO LaunchSite (site_id, site_name, site_city, site_country) VALUES 
('LS002', 'Guiana Space Centre', 'Kourou', 'South America');

INSERT INTO LaunchSite (site_id, site_name, site_city, site_country) VALUES 
('LS003', 'Cape Canaveral AFS', 'Florida', 'USA');

-- Insert values into CelestialBody
INSERT INTO CelestialBody (body_id, name, cb_type, has_atmosphere) VALUES 
('CB001', 'Moon', 'Natural Satellite', 1);

INSERT INTO CelestialBody (body_id, name, cb_type, has_atmosphere) VALUES 
('CB002', '67P/Churyumov-Gerasimenko', 'Comet', 0);

INSERT INTO CelestialBody (body_id, name, cb_type, has_atmosphere) VALUES 
('CB003', 'International Space Station', 'Orbital Space Station', 1);

INSERT INTO CelestialBody (body_id, name, cb_type, has_atmosphere) VALUES 
('CB004', 'Bennu', 'Asteroid', 0);

INSERT INTO CelestialBody (body_id, name, cb_type, has_atmosphere) VALUES 
('CB005', '81P/Wild2', 'Comet', 0);

-- Insert values into SpacecraftModel
INSERT INTO SpacecraftModel (model_name, manufacturer, sc_type, crew_capacity, cargo_capacity_kg) VALUES 
('Command Module', 'North American Aviation', 'crew', 3, 0.00);

INSERT INTO SpacecraftModel (model_name, manufacturer, sc_type, crew_capacity, cargo_capacity_kg) VALUES 
('Rosetta Orbiter', 'Astrium', 'cargo', 0, 300.00);

INSERT INTO SpacecraftModel (model_name, manufacturer, sc_type, crew_capacity, cargo_capacity_kg) VALUES 
('Crew Dragon', 'SpaceX', 'hybrid', 7, 3300.00);

INSERT INTO SpacecraftModel (model_name, manufacturer, sc_type, crew_capacity, cargo_capacity_kg) VALUES 
('OSIRIS-REx', 'Lockheed Martin', 'cargo', 0, 1.00);

INSERT INTO SpacecraftModel (model_name, manufacturer, sc_type, crew_capacity, cargo_capacity_kg) VALUES 
('Stardust', 'Lockheed Martin', 'cargo', 0, 1.00);

-- Insert values into Agency
INSERT INTO Agency (agency_id, agency_name, acronym, agency_location, agency_city, agency_country) VALUES 
(1, 'National Aeronautics and Space Administration', 'NASA', '300 Hidden Figures Way SW', 'Washington', 'USA');

INSERT INTO Agency (agency_id, agency_name, acronym, agency_location, agency_city, agency_country) VALUES 
(2, 'European Space Agency', 'ESA', '8-10 rue Mario Nikis', 'Paris', 'France');

-- Insert values into Astronaut
INSERT INTO Astronaut (astronaut_id, astronaut_name, nationality, dob) VALUES 
(1, 'Armstrong, Neil A.', 'US', TO_DATE('1930-08-05', 'YYYY-MM-DD'));

INSERT INTO Astronaut (astronaut_id, astronaut_name, nationality, dob) VALUES 
(2, 'Aldrin, Edwin "Buzz"', 'US', TO_DATE('1930-01-20', 'YYYY-MM-DD'));

INSERT INTO Astronaut (astronaut_id, astronaut_name, nationality, dob) VALUES 
(3, 'Collins, Michael', 'US', TO_DATE('1930-10-31', 'YYYY-MM-DD'));

INSERT INTO Astronaut (astronaut_id, astronaut_name, nationality, dob) VALUES 
(4, 'Cardman, Zena', 'US', TO_DATE('1987-10-26', 'YYYY-MM-DD'));

INSERT INTO Astronaut (astronaut_id, astronaut_name, nationality, dob) VALUES 
(5, 'Fincke, Michael', 'US', TO_DATE('1967-03-14', 'YYYY-MM-DD'));

-- Insert values into TrainingProgram
INSERT INTO TrainingProgram (program_name, program_location, tp_type) VALUES 
('Topography Recognition', 'Cinder Lake Crater Field, Arizona', 'Field');

INSERT INTO TrainingProgram (program_name, program_location, tp_type) VALUES 
('Sample Collection', 'Grand Canyon, Arizona', 'Field');

-- Insert values into Spacecraft
INSERT INTO Spacecraft (spacecraft_id, model_name, manufacturer) VALUES 
('SC001', 'Command Module', 'North American Aviation');

INSERT INTO Spacecraft (spacecraft_id, model_name, manufacturer) VALUES 
('SC002', 'Rosetta Orbiter', 'Astrium');

INSERT INTO Spacecraft (spacecraft_id, model_name, manufacturer) VALUES 
('SC003', 'Crew Dragon', 'SpaceX');

INSERT INTO Spacecraft (spacecraft_id, model_name, manufacturer) VALUES 
('SC004', 'OSIRIS-REx', 'Lockheed Martin');

INSERT INTO Spacecraft (spacecraft_id, model_name, manufacturer) VALUES 
('SC005', 'Stardust', 'Lockheed Martin');

-- Insert values into Mission
INSERT INTO Mission (mission_id, site_id, body_id, spacecraft_id, spacecraft_name, mission_name, start_date, end_date, launch_date) VALUES 
('M001', 'LS001', 'CB001', 'SC001', 'Columbia', 'Apollo 11', TO_DATE('1969-07-16', 'YYYY-MM-DD'), TO_DATE('1969-07-24', 'YYYY-MM-DD'), TO_DATE('1969-07-16', 'YYYY-MM-DD'));

INSERT INTO Mission (mission_id, site_id, body_id, spacecraft_id, spacecraft_name, mission_name, start_date, end_date, launch_date) VALUES 
('M002', 'LS002', 'CB002', 'SC002', 'Rosetta Orbiter', 'Rosetta', TO_DATE('2004-03-02', 'YYYY-MM-DD'), TO_DATE('2016-09-30', 'YYYY-MM-DD'), TO_DATE('2004-03-02', 'YYYY-MM-DD'));

INSERT INTO Mission (mission_id, site_id, body_id, spacecraft_id, mission_name, start_date, end_date, launch_date) VALUES 
('M003', 'LS001', 'CB003', 'SC003', 'SpaceX Crew-11', TO_DATE('2025-08-01', 'YYYY-MM-DD'), TO_DATE('2025-08-01', 'YYYY-MM-DD'), TO_DATE('2025-08-01', 'YYYY-MM-DD'));

INSERT INTO Mission (mission_id, site_id, body_id, spacecraft_id, mission_name, start_date, end_date, launch_date) VALUES 
('M004', 'LS003', 'CB004', 'SC004', 'OSIRIS-REx', TO_DATE('2016-09-08', 'YYYY-MM-DD'), TO_DATE('2023-09-24', 'YYYY-MM-DD'), TO_DATE('2016-09-08', 'YYYY-MM-DD'));

INSERT INTO Mission (mission_id, site_id, body_id, spacecraft_id, mission_name, start_date, end_date, launch_date) VALUES 
('M005', 'LS003', 'CB005', 'SC005', 'Stardust', TO_DATE('1999-02-07', 'YYYY-MM-DD'), TO_DATE('2006-01-15', 'YYYY-MM-DD'), TO_DATE('1999-02-07', 'YYYY-MM-DD'));

-- Insert values into MissionLog
INSERT INTO MissionLog (log_date, mission_id, entry_type, status, description) VALUES 
(TO_DATE('1969-07-16', 'YYYY-MM-DD'), 'M001', 'Launch', 'Success', 'Lift-off on Apollo 11');

INSERT INTO MissionLog (log_date, mission_id, entry_type, status, description) VALUES 
(TO_DATE('1969-07-20', 'YYYY-MM-DD'), 'M001', 'Landing', 'Success', 'The Eagle has landed');

INSERT INTO MissionLog (log_date, mission_id, entry_type, status, description) VALUES 
(TO_DATE('2018-12-03', 'YYYY-MM-DD'), 'M004', 'Landing', 'Success', 'Arrived at Asteroid Bennu');

INSERT INTO MissionLog (log_date, mission_id, entry_type, status, description) VALUES 
(TO_DATE('2004-01-02', 'YYYY-MM-DD'), 'M005', 'Comet Encounter', 'Success', 'Collected dust using aerogel collector');

-- Insert values into Carries
INSERT INTO Carries (mission_id, equipment_serial_num) VALUES 
('M001', 'EQ001');

INSERT INTO Carries (mission_id, equipment_serial_num) VALUES 
('M002', 'EQ002');

INSERT INTO Carries (mission_id, equipment_serial_num) VALUES 
('M002', 'EQ003');

-- Insert values into ParticipateIn
INSERT INTO ParticipateIn (agency_id, mission_id, role) VALUES 
(1, 'M001', 'Lead');

INSERT INTO ParticipateIn (agency_id, mission_id, role) VALUES 
(2, 'M002', 'Lead');

INSERT INTO ParticipateIn (agency_id, mission_id, role) VALUES 
(1, 'M003', 'Lead');

INSERT INTO ParticipateIn (agency_id, mission_id, role) VALUES 
(1, 'M004', 'Lead');

INSERT INTO ParticipateIn (agency_id, mission_id, role) VALUES 
(1, 'M005', 'Lead');

-- Insert values into Pilot
INSERT INTO Pilot (astronaut_id, flight_hours) VALUES 
(1, 2400.00);

INSERT INTO Pilot (astronaut_id, flight_hours) VALUES 
(5, 1900.00);

-- Insert values into Researcher
INSERT INTO Researcher (astronaut_id, field) VALUES 
(4, 'Geobiology');

-- Insert values into AssignedTo
INSERT INTO AssignedTo (astronaut_id, mission_id) VALUES 
(1, 'M001');

INSERT INTO AssignedTo (astronaut_id, mission_id) VALUES 
(2, 'M001');

INSERT INTO AssignedTo (astronaut_id, mission_id) VALUES 
(3, 'M001');

INSERT INTO AssignedTo (astronaut_id, mission_id) VALUES 
(4, 'M003');

INSERT INTO AssignedTo (astronaut_id, mission_id) VALUES 
(5, 'M003');

-- Insert values into TrainedIn
INSERT INTO TrainedIn (astronaut_id, program_name, program_location) VALUES 
(1, 'Topography Recognition', 'Cinder Lake Crater Field, Arizona');

INSERT INTO TrainedIn (astronaut_id, program_name, program_location) VALUES 
(2, 'Topography Recognition', 'Cinder Lake Crater Field, Arizona');

INSERT INTO TrainedIn (astronaut_id, program_name, program_location) VALUES 
(3, 'Topography Recognition', 'Cinder Lake Crater Field, Arizona');

INSERT INTO TrainedIn (astronaut_id, program_name, program_location) VALUES 
(1, 'Sample Collection', 'Grand Canyon, Arizona');

INSERT INTO TrainedIn (astronaut_id, program_name, program_location) VALUES 
(2, 'Sample Collection', 'Grand Canyon, Arizona');

INSERT INTO TrainedIn (astronaut_id, program_name, program_location) VALUES 
(3, 'Sample Collection', 'Grand Canyon, Arizona');