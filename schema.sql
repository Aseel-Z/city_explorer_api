DROP TABLE locations, 
 
CREATE TABLE IF NOT EXISTS locations (
 location_id SERIAL PRIMARY KEY,   
 search_query VARCHAR (255),
 formatted_query VARCHAR (255),
 longitude NUMERIC (10,5),
 latitude NUMERIC (10,5)
)