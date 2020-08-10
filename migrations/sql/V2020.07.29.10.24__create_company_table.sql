CREATE TABLE IF NOT EXISTS company_payment_info (
    company_name varchar NOT NULL PRIMARY KEY,
    company_address varchar NOT NULL,
    po_number varchar NOT NULL,
    qualified_receiver_name varchar NOT NULL,
    expense_authority_name varchar NOT NULL,
    create_user varchar NOT NULL,
    create_timestamp timestamptz NOT NULL DEFAULT now(),
    update_user varchar NOT NULL,
    update_timestamp timestamptz NOT NULL DEFAULT now()
);

INSERT INTO company_payment_info(company_name, company_address, po_number, qualified_receiver_name, expense_authority_name, create_user, update_user) VALUES
('0894592 B.C. LTD.', '9007 115 AVE, FORT ST. JOHN, V1J6J3', 'EM21DSP0001', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('1251048 B.C. LTD.', '615 SILICA ST, NELSON, V1L4N2 ', 'EM21DSP0002', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('478940 B.C. LTD.', '8811 103 ST, FORT ST. JOHN, V1J5R3', 'EM21DSP0003', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('AAA FIELD SERVICES LTD.', 'UNIT A -10219 ALASKA RD, FORT ST. JOHN, V1J1A9', 'EM21DSP0004', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('ALBRIGHT FLUSH SYSTEMS LTD.', 'PO BOX 6148 STN MAIN, FORT ST. JOHN, V1J4H6', 'EM21DSP0005', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('ARLETTA ENVIRONMENTAL CONSULTING (BC) CORP.', '10107 101 AVENUE, FORT ST. JOHN, V1J2B4', 'EM21DSP0006', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('BARTEK WIRELINE SERVICES LTD.', 'RR 1 SITE 1 COMP 40, FORT ST. JOHN, V1J4M6', 'EM21DSP0007', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('BONNETT''S ENERGY CORP.', '9503 112 ST, FORT ST. JOHN, V1J7C7', 'EM21DSP0008', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('BOREK CONSTRUCTION (NORTHERN) INC.', 'PO BOX 870 STN MAIN, DAWSON CREEK, V1G4H8', 'EM21DSP0009', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('CANCOR PRESSURE CEMENTERS INC.', 'PO BOX 6646 STN MAIN FORT ST. JOHN, V1J4J1', 'EM21DSP0010', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('CANDOO OILFIELD SERVICES INC.', 'RR 1, SITE 16 COMP 133, FORT ST. JOHN, V1J4M6', 'EM21DSP0011', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('CEDA WEST SERVICES LIMITED', '42 VIC TURNER AIRPORT RD, DAWSON CREEK, V1G0G1', 'EM21DSP0012', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('CLEARSTREAM ENERGY SERVICES LIMITED PARTNERSHIP', 'PO BOX 6411 STN MAIN, FORT ST. JOHN, V1J4H6', 'EM21DSP0013', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('CURTIS YORK TRUCKING LTD.', '33 VIC TURNER AIRPORT RD, DAWSON CREEK, V1G0G1', 'EM21DSP0014', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('D. LOEWEN ENTERPRISES LTD.', 'PO BOX 136, ROSE PRAIRIE, V0C2H0', 'EM21DSP0015', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('DAKOTA CONTRACTING LTD.', '1141 97 AVE, DAWSON CREEK, V1G1N5', 'EM21DSP0016', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('DFA CONTRACTING LTD.', 'SS2 SITE 12 COMP 245, FORT ST. JOHN, V1J4M7', 'EM21DSP0017', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('DITMARSIA HOLDINGS LTD.', '7907 101 AVE, FORT ST. JOHN, V1J2A1', 'EM21DSP0018', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('DOWNTON''S TRANSPORT LTD.', '8107 93 ST, FORT ST. JOHN, V1J6X1', 'EM21DSP0019', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('D-W WILSON SERVICES LTD.', '7904 101 AVE, FORT ST. JOHN, V1J2A3', 'EM21DSP0020', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('ELITE WELL TESTING INC.', '8928 115 AVE, FORT ST. JOHN, V1J2X8', 'EM21DSP0021', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('ENERGETIC SERVICES INC.', 'PO BOX 6639, FORT ST. JOHN, V1J4J1', 'EM21DSP0022', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('FLORITE ENVIRONMENTAL SYSTEMS INC.', 'PO BOX 6358 STN MAIN, FORT ST. JOHN, V1J4H8', 'EM21DSP0023', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('G & C PRODUCTS LTD.', 'BOX 658, FORT NELSON, V0C1R0', 'EM21DSP0024', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('GOODLO HOLDINGS LTD.', 'PO BOX 6886 STN MAIN, FORT ST. JOHN, V1J4J3', 'EM21DSP0025', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('GRIMES WELL SERVICING LTD.', '8011 93 ST, FORT ST. JOHN, V1J6X1', 'EM21DSP0026', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('H3M ENVIRONMENTAL LTD.', '7916 ALASKA RD, FORT ST. JOHN, V1J0P3', 'EM21DSP0027', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('HALFWAY RIVER VENTURES LTD.', '101-10012 97 AVE, FORT ST. JOHN, V1J5P3', 'EM21DSP0028', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('HALLIBURTON GROUP CANADA', '10503 87 AVE, FORT ST. JOHN, V1J5K6', 'EM21DSP0029', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('HIGHMARK ENVIRONMENTAL SERVICES LTD.', '10121 95TH AVE, FORT ST. JOHN, V1J1H9', 'EM21DSP0030', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('HIGHMARK OILFIELD SERVICES LTD.', 'SS 2, SITE 12, COMP25, FORT ST. JOHN, V1J4M7', 'EM21DSP0031', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('IDEAL COMPLETION SERVICES INC.', 'PO BOX 6640 STN MAIN, FORT ST. JOHN, V1J4J1', 'EM21DSP0032', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('INFINITY MEDIC SERVICES LTD.', '338 MAPLE STREET, KAMLOOPS, V2B4A8', 'EM21DSP0033', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('KLASSEN BROTHERS NORTHERN LTD.', 'PO BOX 309, POUCE COUPE, V0C2C0', 'EM21DSP0034', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('KPA OILFIELD SERVICES LTD.', '4325 HWY 29 N, CHETWYND, V0C1J0', 'EM21DSP0035', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('MASTEC CANADA INC.', '9929 SWANSON ST, FORT ST. JOHN, V1J4M6', 'EM21DSP0036', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('MATRIX SOLUTIONS INC.', '11312 100 AVE, FORT ST. JOHN, V1J1Z9', 'EM21DSP0037', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('MILLENNIUM EMS SOLUTIONS LTD.', '300-722 CORMORANT ST, VICTORIA, V8W1P8', 'EM21DSP0038', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('MUSTANG RENTALS LTD.', 'PO BOX 6520 STN MAIN, FORT ST. JOHN, V1J4H9', 'EM21DSP0039', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('NEMESIS OILFIELD SERVICES LTD.', 'PO BOX 351 RPO DOWNTOWN, FORT ST. JOHN, V1J6W7', 'EM21DSP0040', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('NES GLOBAL LIMITED', '201-4630 LAZELLE AVE, TERRACE, V8G1S6', 'EM21DSP0041', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('NORTH NIG CONTRACTING LTD.', 'PO BOX 6175 STN MAIN, FORT ST. JOHN, V1J4H7', 'EM21DSP0042', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('NORTH SHORE ENVIRONMENTAL CONSULTANTS INC.', '20-250 HOWE ST, VANCOUVER, V6C3R8', 'EM21DSP0043', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('NUWAVE INDUSTRIES INC.', '11927 242 RD, FORT ST. JOHN, V1J4M7', 'EM21DSP0044', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('POOR BOY TRUCKING LTD.', 'SS 2 SITE 20 COMP 26 STN MAIN, FORT ST. JOHN, V1J4M7', 'EM21DSP0045', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('PRECISION LIMITED PARTNERSHIP', '6820 87A AVE, FORT ST. JOHN, V1J0B4', 'EM21DSP0046', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('PROFOXX ASSET RETIREMENT MANAGEMENT LTD.', '600-777 HORNBY ST, VANCOUVER, V6Z1S4', 'EM21DSP0047', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('PROSPECT ENVIRONMENTAL SERVICES LTD.', '10514 87 AVE, FORT ST. JOHN, V1J5K7', 'EM21DSP0048', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('RANGEVIEW OILFIELD SALES INC.', '1665 ELLIS ST, KELOWNA, V1Y2B3', 'EM21DSP0049', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('RAPID WIRELINE SERVICES LTD.', '10703 87 AVE, FORT ST. JOHN, V1J5P7', 'EM21DSP0050', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('RELIANCE OFS CANADA LTD.', 'PO BOX 6640 STN MAIN, FORT ST. JOHN, V1J4J1', 'EM21DSP0051', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('RESOLVE ENERGY SOLUTIONS INC.', '101-6911 100 AVE, FORT ST. JOHN, V1J5T8', 'EM21DSP0052', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('RIDGELINE CANADA INC.', '10217 102 ST, FORT ST. JOHN, V1J4B6', 'EM21DSP0053', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('RIDGELINE HOLDINGS', '10217 102 ST, FORT ST. JOHN, V1J4B6', 'EM21DSP0054', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('ROY NORTHERN ENVIRONMENTAL LTD.', '207-10139 100 ST, FORT ST. JOHN, V1J3Y6', 'EM21DSP0055', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('ROY NORTHERN LAND SERVICE LTD.', '207-10139 100 ST, FORT ST. JOHN, V1J3Y6', 'EM21DSP0056', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('ROYAL CAMP SERVICES LTD.', 'PO BOX 321, SMITHERS, V0J2N0', 'EM21DSP0057', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('SANJEL ENERGY SERVICES INC.', '9616 81 AVE, FORT ST. JOHN, V1J6R4', 'EM21DSP0058', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('SAVANNA WELL SERVICING INC.', 'PO BOX 210 STN MAIN, DAWSON CREEK, V1G4G3', 'EM21DSP0059', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('SECURE ENERGY (ONSITE SERVICES) INC.', '8224 93 ST, FORT ST. JOHN, V1J6Y5', 'EM21DSP0060', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('SECURE ENERGY SERVICES INC.', 'PO BOX 28, DAWSON CREEK, V1G3T0', 'EM21DSP0061', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('SHAPRING VENTURES LTD.', 'PO BOX 143, DAWSON CREEK, V1G3T0', 'EM21DSP0062', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('SILVER CITY INVESTMENTS LTD.', 'PO BOX 2701 STN MAIN, DAWSON CREEK, V1G5A1', 'EM21DSP0063', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('SNC-LAVALIN INC.', '10012 97 AVE, FORT ST. JOHN, V1J5P3', 'EM21DSP0064', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('SYNERGYASPEN ENVIRONMENTAL INC.', '9904 106 ST, FORT ST. JOHN, V1J1V8', 'EM21DSP0065', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('TERMINIS MANAGEMENT LTD.', '8107 93 ST, FORT ST. JOHN, V1J6X1', 'EM21DSP0066', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('TERRALOGIX SOLUTIONS INC.', '900-885  GEORGIA ST WEST, VANCOUVER, V6C3H1', 'EM21DSP0067', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('TERRAWEST ENVIRONMENTAL INC.', 'PO BOX 58, COWICHAN BAY, V0R1N0', 'EM21DSP0068', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('TERVITA CORPORATION', '10215 100 ST, FORT ST. JOHN, V1J3Y8', 'EM21DSP0069', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('TRICAN WELL SERVICE LTD.', '11003 91 AVE, FORT ST. JOHN, V1J6G7', 'EM21DSP0070', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('TROJAN SAFETY SERVICES LTD.', 'PO BOX 6277 STN MAIN, FORT ST. JOHN, V1J4H7', 'EM21DSP0071', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('TROYER VENTURES LTD.', '9303 85 AVE, FORT ST. JOHN, V1J5Z3', 'EM21DSP0072', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('TWS GP LTD.', '2578-550 BURRARD STREET, VANCOUVER, V6C2B5', 'EM21DSP0073', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('V.D.M. TRUCKING SERVICE LTD.', 'PO BOX 1536 STN MAIN, KAMLOOPS, V2C6L8', 'EM21DSP0074', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('VERTEX PROFESSIONAL SERVICES LTD.', '10216 94 AVE, FORT ST. JOHN, V1J4X3', 'EM21DSP0075', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system'),
('VERTEX PROJECT MANAGEMENT', '10216 94 AVE, FORT ST. JOHN, V1J4X3', 'EM21DSP0076A', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('VERTEX RESOURCE SERVICES LTD.', '5401 46TH AVE N, FORT NELSON, V0C1R0', 'EM21DSP0077', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('WINDWARD RESOURCES LTD.', 'SS2, SITE 6, COMP 28, FORT ST. JOHN, V1J4M7', 'EM21DSP0078', 'Rebecca Stevenson', 'Michelle Schwabe', 'system', 'system'),
('XTREME OILFIELD TECHNOLOGY LTD.', 'PO BOX 6157 STN MAIN, FORT ST. JOHN, V1J4H7', 'EM21DSP0079', 'Rebecca Stevenson', 'May Mah-Paulson', 'system', 'system')
ON CONFLICT DO NOTHING;
