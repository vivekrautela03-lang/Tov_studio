const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Parse .env.local variables manually since we run in plain node environment
const envPath = path.join(__dirname, ".env.local");
let dbUrl = process.env.DATABASE_URL;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const matches = envContent.match(/DATABASE_URL=(.+)/);
  if (matches && matches[1]) {
    dbUrl = matches[1].trim();
  }
}

if (!dbUrl) {
  console.error("Error: DATABASE_URL not found in environment or .env.local.");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSeed() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database successfully.");

    // 1. Run migrations SQL
    const migrationSql = fs.readFileSync(
      path.join(__dirname, "supabase", "migrations", "0021_create_team_management_tables.sql"),
      "utf8"
    );
    await client.query(migrationSql);
    console.log("Database migrations applied successfully.");

    // Clean out existing seeded data to prevent duplicates on reruns
    await client.query("TRUNCATE public.cast_members, public.crew_members, public.roles, public.departments CASCADE;");
    console.log("Truncated team tables to ensure fresh seed.");

    // 2. Insert Departments
    const depts = [
      "Directors",
      "Producers",
      "Writers",
      "Camera Team",
      "Editors",
      "Production",
      "Sound",
      "VFX",
      "Art Department",
      "Others"
    ];

    const deptMap = {};
    for (const name of depts) {
      const res = await client.query(
        "INSERT INTO public.departments (name) VALUES ($1) RETURNING id;",
        [name]
      );
      deptMap[name] = res.rows[0].id;
    }
    console.log("Inserted departments.");

    // 3. Seed Cast Members (12 entries)
    const castData = [
      {
        full_name: "Shrishti Naudiyal",
        gender: "Female",
        phone: "8279600893",
        email: "shrishtinaudiyal19@gmail.com",
        college: "Uttaranchal",
        status: "Available",
        skills: ["Acting", "Drama"],
        languages: ["Hindi", "English"],
        experience: "1 Year",
        photo_url: null,
        notes: "Female lead and theater experience."
      },
      {
        full_name: "Apeksha",
        gender: "Female",
        phone: "9548954405",
        email: "apankyamba27@gmail.com",
        college: "Uttaranchal",
        status: "Available",
        skills: ["Acting", "Dance", "Expressions"],
        languages: ["Hindi", "English"],
        experience: "2 Years",
        photo_url: "/team/apeksha.png",
        notes: "Experienced female actor, active."
      },
      {
        full_name: "Naina Gautam",
        gender: "Female",
        phone: "7617484123",
        email: "nainagautam272@gmail.com",
        college: "Uttaranchal",
        status: "Shooting",
        skills: ["Acting", "Modeling"],
        languages: ["Hindi", "English"],
        experience: "3 Years",
        photo_url: "/team/naina.png",
        notes: "Currently shooting for short features."
      },
      {
        full_name: "Anjali Negi",
        gender: "Female",
        phone: "7895962807",
        email: "anjalinegi@gmail.com",
        college: "SRHU",
        status: "Available",
        skills: ["Acting", "Monologues"],
        languages: ["Hindi"],
        experience: "1 Year",
        photo_url: "/team/anjali.png",
        notes: "Talented college lead."
      },
      {
        full_name: "Mansi",
        gender: "Female",
        phone: "7895928297",
        email: "mansi.bandooni@gmail.com",
        college: "Uttaranchal",
        status: "Busy",
        skills: ["Acting", "Classical Dance"],
        languages: ["Hindi"],
        experience: "2 Years",
        photo_url: "/team/mansi.png",
        notes: "Busy with theater productions."
      },
      {
        full_name: "Samiksha",
        gender: "Female",
        phone: "7807113407",
        email: "Samikshagaur1016@gmail.com",
        college: "Doon university",
        status: "Available",
        skills: ["Acting", "Voiceover"],
        languages: ["Hindi", "English"],
        experience: "1 Year",
        photo_url: "/team/samiksha.png",
        notes: "Doon university theater society member."
      },
      {
        full_name: "Amarjeet",
        gender: "Male",
        phone: "8979489198",
        email: "amarjeetsidhu221@gmail.com",
        college: "Uttaranchal",
        status: "Available",
        skills: ["Acting", "Action", "Stunts"],
        languages: ["Hindi", "Punjabi"],
        experience: "2 Years",
        photo_url: "/team/amarjeet.png",
        notes: "Action scenes specialist."
      },
      {
        full_name: "Sumit",
        gender: "Male",
        phone: "9012853213",
        email: "umitsingh75@gmail.com",
        college: "Uttaranchal",
        status: "Shooting",
        skills: ["Acting", "Romantic lead"],
        languages: ["Hindi"],
        experience: "2 Years",
        photo_url: "/team/sumit.png",
        notes: "Currently on shooting schedule."
      },
      {
        full_name: "Yashraj",
        gender: "Male",
        phone: "7908356047",
        email: "yashrajsamantha44@gmail.com",
        college: "Uttaranchal",
        status: "Available",
        skills: ["Acting", "Comedy"],
        languages: ["Hindi", "English"],
        experience: "3 Years",
        photo_url: "/team/yashraj.png",
        notes: "Excellent comedy timing."
      },
      {
        full_name: "Pratyaksh",
        gender: "Male",
        phone: "9520441313",
        email: "him.chapanal143@gmail.com",
        college: "Graphic deemed",
        status: "Available",
        skills: ["Acting", "Monoact"],
        languages: ["Hindi"],
        experience: "1 Year",
        photo_url: "/team/pratyaksh.png",
        notes: "Lead actor in several street dramas."
      },
      {
        full_name: "Adarsh",
        gender: "Male",
        phone: "6202818148",
        email: "adarshsaini4307@gmail.com",
        college: "Uttaranchal",
        status: "Busy",
        skills: ["Acting", "Dubbing"],
        languages: ["Hindi"],
        experience: "2 Years",
        photo_url: "/team/adarsh.png",
        notes: "Busy with academic features."
      },
      {
        full_name: "Priyank",
        gender: "Male",
        phone: "8791542906",
        email: "Priyankbisht10jan2005@gmail.com",
        college: "Graphic hill university",
        status: "Available",
        skills: ["Acting", "Drama"],
        languages: ["Hindi", "English"],
        experience: "1 Year",
        photo_url: "/team/priyank.png",
        notes: "Enthusiastic and versatile talent."
      }
    ];

    for (const cast of castData) {
      await client.query(
        `INSERT INTO public.cast_members (
          full_name, gender, phone, email, college, status, skills, languages, experience, photo_url, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          cast.full_name,
          cast.gender,
          cast.phone,
          cast.email,
          cast.college,
          cast.status,
          cast.skills,
          cast.languages,
          cast.experience,
          cast.photo_url,
          cast.notes
        ]
      );
    }
    console.log("Seeded cast members successfully.");

    // 4. Seed Crew Members (7 entries)
    const crewData = [
      {
        full_name: "Vivek Rautela",
        department: "Directors",
        position: "FOUNDER / Director",
        phone: "9068892966",
        email: "vivekrautela03@gmail.com",
        college: "Uttaranchal",
        availability: "Available",
        experience: "4 Years",
        skills: ["Direction", "Screenwriting", "Producer"],
        notes: "Founder & Creative Director of The Oldverse Productions.",
        photo_url: "/team/vivek_rautela.png"
      },
      {
        full_name: "Shivanshi",
        department: "Producers",
        position: "FOUNDER / Producer",
        phone: "9999134671",
        email: "Shivanshirauthan1@gmail.com",
        college: "Uttaranchal",
        availability: "Available",
        experience: "4 Years",
        skills: ["Production Management", "Finance", "Scheduling"],
        notes: "Founder & Executive Producer.",
        photo_url: "/team/shivanshi.png"
      },
      {
        full_name: "Ujjwal Gurung",
        department: "Camera Team",
        position: "Cinematographer",
        phone: "7719315334",
        email: "ujjwalgunung3024@gmail.com",
        college: "Uttaranchal",
        availability: "Shooting",
        experience: "3 Years",
        skills: ["Lighting", "Steadicam", "DIT"],
        notes: "Lead cinematographer, specializes in night shoots.",
        photo_url: "/team/ujjwal.png"
      },
      {
        full_name: "Siddharth Singh",
        department: "Camera Team",
        position: "Camera Assistant",
        phone: "9794112381",
        email: "Siddharthraghuvanshi776@gmail.com",
        college: "Uttaranchal",
        availability: "Available",
        experience: "2 Years",
        skills: ["Camera Rigging", "Focus Pulling"],
        notes: "Dedicated camera assistant.",
        photo_url: "/team/siddharth.png"
      },
      {
        full_name: "Prince",
        department: "Camera Team",
        position: "Camera Assistant",
        phone: "9142815925",
        email: "Princekumari892000@gmail.com",
        college: "Uttaranchal",
        availability: "Available",
        experience: "1 Year",
        skills: ["Grip", "Focus Assist"],
        notes: "Energetic camera crew member.",
        photo_url: "/team/prince.png"
      },
      {
        full_name: "Shivansh Morya",
        department: "Editors",
        position: "Lead Editor",
        phone: "8439238588",
        email: "shivanshmorya07@gmail.com",
        college: "Uttaranchal",
        availability: "Available",
        experience: "3 Years",
        skills: ["Premiere Pro", "DaVinci Resolve", "Color Grading"],
        notes: "Specializes in editing cyberpunk and neon film aesthetics.",
        photo_url: "/team/shivansh_morya.png"
      },
      {
        full_name: "Aman dhami",
        department: "Editors",
        position: "Assistant Editor",
        phone: "7302937529",
        email: "",
        college: "Uttaranchal",
        availability: "Available",
        experience: "1 Year",
        skills: ["Audio Sync", "Rough Cuts"],
        notes: "Undergoing edit training.",
        photo_url: null
      }
    ];

    for (const crew of crewData) {
      const deptId = deptMap[crew.department];
      await client.query(
        `INSERT INTO public.crew_members (
          full_name, department_id, position, phone, email, college, availability, experience, skills, notes, photo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
        [
          crew.full_name,
          deptId,
          crew.position,
          crew.phone,
          crew.email,
          crew.college,
          crew.availability,
          crew.experience,
          crew.skills,
          crew.notes,
          crew.photo_url
        ]
      );
    }
    console.log("Seeded crew members successfully.");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

runSeed();
