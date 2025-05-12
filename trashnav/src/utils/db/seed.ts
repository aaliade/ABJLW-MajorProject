import { db } from './index';
import { sql } from 'drizzle-orm';


// matilda's and jack's cant work

async function seed() {
  await db.execute(sql`
    INSERT INTO reports (id, user_id, name, address, latitude, longitude, garbagelevel) VALUES
  (1, 1, 'Papine Market', 'Papine', 18.0164, -76.7442, 85),
  (2, 1, 'UWI Entrance', 'Papine', 18.0055, -76.7481, 45),
  (3, 1, 'Papine Square', 'Papine', 18.0173, -76.7438, 75),
  (4, 1, 'Hope Road Junction', 'Papine', 18.0145, -76.7459, 90),
  (5, 1, 'Gordon Town Road', 'Papine', 18.0187, -76.7412, 60),
  (6, 1, 'August Town Road', 'Papine', 18.0197, -76.7432, 82),
  (7, 1, 'University Hospital', 'Papine', 18.0087, -76.7465, 25),
  (8, 1, 'Mona Heights', 'Papine', 18.0109, -76.7492, 38),
  (9, 1, 'Tavern Community', 'Papine', 18.0201, -76.7398, 95),
  (10, 1, 'Mona Road', 'Papine', 18.0068, -76.7452, 55),
  (11, 1, 'Golding Avenue', 'Papine', 18.0048, -76.7439, 43),
  (12, 1, 'Mona Common', 'Papine', 18.0135, -76.7425, 78),
  (13, 1, 'August Town Police Station', 'Papine', 18.0189, -76.7389, 32),
  (14, 1, 'University Crescent', 'Papine', 18.0079, -76.7472, 59),
  (15, 1, 'Chancellor Hall', 'Papine', 18.0052, -76.7459, 65),
  (16, 1, 'Liguanea Plaza', 'Liguanea', 18.0055, -76.7756, 65),
  (17, 1, 'Sovereign Centre', 'Liguanea', 18.0042, -76.7789, 40),
  (18, 1, 'Hope Road', 'Liguanea', 18.0075, -76.7742, 85),
  (19, 1, 'Old Hope Road', 'Liguanea', 18.0101, -76.7726, 55),
  (20, 1, 'Lady Musgrave Road', 'Liguanea', 18.0028, -76.7801, 70),
  (21, 1, 'Kings House', 'Liguanea', 18.0095, -76.7773, 28),
  (22, 1, 'Devon House', 'Liguanea', 18.0119, -76.7799, 35),
  (23, 1, 'Hope Gardens', 'Liguanea', 18.0145, -76.7783, 22),
  (24, 1, 'Hope Zoo', 'Liguanea', 18.0152, -76.7768, 45),
  (25, 1, 'UTECH Campus', 'Liguanea', 18.0181, -76.7732, 58),
  (26, 1, 'Matilda''s Corner', 'Liguanea', 18.0071, -76.7712, 79),
  (27, 1, 'Barbican Road', 'Liguanea', 18.0132, -76.7693, 82),
  (28, 1, 'Jack''s Hill Road', 'Liguanea', 18.0175, -76.7638, 38),
  (29, 1, 'Grants Pen Road', 'Liguanea', 18.0201, -76.7719, 88),
  (30, 1, 'Constant Spring Road', 'Liguanea', 18.0219, -76.7752, 72),
  (31, 1, 'Kintyre Main Road', 'Kintyre', 18.0344, -76.7255, 95),
  (32, 1, 'Kintyre Community Centre', 'Kintyre', 18.0329, -76.7274, 60),
  (33, 1, 'Kintyre Primary School', 'Kintyre', 18.0351, -76.7246, 40),
  (34, 1, 'Dublin Drive', 'Kintyre', 18.0365, -76.7233, 85),
  (35, 1, 'Tredegar Park', 'Kintyre', 18.0311, -76.7292, 70),
  (36, 1, 'Wedge Close', 'Kintyre', 18.0338, -76.7219, 87),
  (37, 1, 'Sylvan Avenue', 'Kintyre', 18.0323, -76.7242, 49),
  (38, 1, 'Leckford Avenue', 'Kintyre', 18.0313, -76.7231, 62),
  (39, 1, 'Deanery Road', 'Kintyre', 18.0355, -76.7281, 78),
  (40, 1, 'Hillview Avenue', 'Kintyre', 18.0305, -76.7263, 31),
  (41, 1, 'Deanery Drive', 'Kintyre', 18.0372, -76.7269, 53),
  (42, 1, 'Langston Road', 'Kintyre', 18.0382, -76.7251, 92),
  (43, 1, 'Whitehall Avenue', 'Kintyre', 18.0299, -76.7239, 67),
  (44, 1, 'Kintyre Heights', 'Kintyre', 18.0318, -76.7213, 73),
  (45, 1, 'Mountain View Avenue', 'Kintyre', 18.0292, -76.7276, 89);
  `);

  console.log('✅ Reports table seeded with 45 locations');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
});









