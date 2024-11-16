const mongoose = require('mongoose');
const express = require('express');
const fs = require('fs');
const path = require("path")
const multer = require('multer');


const { Schema } = mongoose;
//mongodb://18.232.124.147:27017/election-monitoring-db-exp
mongoose.connect('mongodb+srv://afrirewards:Afri12345Rewards@afrirewards.da6lul0.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(e=>{
  console.log("connected successfully")
})

const ElectionLocationType = {
  POLLING_UNIT: 'POLLING_UNIT',
  WARD: 'WARD',
  LOCAL_GOVERNMENT: 'LOCAL_GOVERNMENT',
  STATE: 'STATE',
  COUNTRY: 'COUNTRY',
  REPRESENTATIVE_DISTRICT: 'REPRESENTATIVE_DISTRICT',
  SENATORIAL_DISTRICT: 'SENATORIAL_DISTRICT',
};

const ElectionType = {
  COUNCIL: 'COUNCIL',
  CHAIRMANSHIP: 'CHAIRMANSHIP',
  GUBERNATORIAL: 'GUBERNATORIAL',
  PRESIDENTIAL: 'PRESIDENTIAL',
  REPRESENTATIVE: 'REPRESENTATIVE',
  SENATORIAL: 'SENATORIAL',
};

const FieldCreateOption = {
  ALL: 1,
  INCLUDE: 2,
  EXCLUDE: 3,
};

const PhysicalLocationSchema = new Schema({
    _id: String,
  lat: { type: Number, required: false },
  long: { type: Number, required: false },
  address: { type: String, required: false },
});

const ElectionLocationSchema = new Schema({
    lga_id: { type: String, required: true },
    locationType: { 
      type: String, 
      enum: ElectionLocationType, 
      required: false 
    },
    childrenLocation: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'ElectionLocation' 
    }],
    childrenLocationIds: [{ 
      type: String, // Store just ObjectId strings
      required: false 
    }],
    parentLocation: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'ElectionLocation' 
    },
    parentLocationId: { 
      type: String, // Store the raw parent location ID as a string
      required: false 
    },
    location: { 
      type: PhysicalLocationSchema, 
      required: false 
    },
    name: { 
      type: String, 
      required: false 
    },
    lga_id: { 
      type: String, 
      required: false 
    },
    country_id: { 
      type: String, 
      required: false 
    },
    state_id: { 
      type: String, 
      required: false 
    },
    ward_id: { 
      type: String, 
      required: false 
    },
    senatorial_district_id: { 
      type: String, 
      required: false 
    },
    representative_district_id: { 
      type: String, 
      required: false 
    },
  });
  

const SinglePartyElectionResultSchema = new Schema({
    _id: String,
  politicalParty: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: false },
  politicalPartyId: { type: String, required: false },
  totalVotes: { type: Number, required: true },
});

const ElectionResultPostSchema = new Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: false },
  election_result:[]
});

const ElectionResultPostCommentSchema = new Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionResultPost', required: false },
  postId: { type: String, required: false },
});

const ElectionIncidentReportPostSchema = new Schema({
    _id: String,
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionLocation', required: false },
  locationId: { type: String, required: false },
  authorPhysicalLocation: { type: PhysicalLocationSchema, required: false },
  imageUrls: { type: [String], required: false },
  videoUrls: { type: [String], required: false },
  description: { type: String, required: false },
  title: { type: String, required: false },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: false },
  electionId: { type: String, required: false },
  relatedElectionResult: { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionResultPost', required: false },
});

const ElectionIncidentReportCommentSchema = new Schema({
  _id: String,
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionIncidentReportPost', required: false },
  postId: { type: String, required: false },
});

const ElectionSchema = new Schema({
  name: { type: String, required: true, unique: true }, // Election name with unique constraint
  type: { type: String, enum: Object.values(ElectionType), required: false },
  name: { type: String, required: false },
  electionLocationId: { type: String, required: false },
  location: String,
  country: String,
  org:[
    { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionOrg', required: false } // Allows flexibility in each candidate object
  ],
  candidates: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionCandidate', required: false }// Allows flexibility in each candidate object
  ]
});

const ElectionCandidateSchema = new Schema({
  full_name: { type: String, required: true },
  org:{type:mongoose.Schema.Types.Mixed},
  file: { type: String, required: true },
});
const ElectionResultSchema = new Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: false },
  org: [
    {
      orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'ElectionOrg', required: false }, // Reference to ElectionOrg
      result: { type: String, default: '0' } // The result for each org
    }

  ], 
  lga:{ type: mongoose.Schema.Types.ObjectId, ref: 'ElectionLocation', required: false },// Allows flexibility in each candidate object
  file: { type: String},
});

const ElectionOrgSchema = new Schema({
name: { type: String, required: true },
acronym: { type: String, required: true },
file: { type: String, required: true },
color: { type: String, required: true },
});

// Models
const ElectionLocation = mongoose.model('ElectionLocation', ElectionLocationSchema);
const SinglePartyElectionResult = mongoose.model('SinglePartyElectionResult', SinglePartyElectionResultSchema);
const ElectionResultPost = mongoose.model('ElectionResultPost', ElectionResultPostSchema);
const ElectionResultPostComment = mongoose.model('ElectionResultPostComment', ElectionResultPostCommentSchema);
const ElectionIncidentReportPost = mongoose.model('ElectionIncidentReportPost', ElectionIncidentReportPostSchema);
const ElectionIncidentReportComment = mongoose.model('ElectionIncidentReportComment', ElectionIncidentReportCommentSchema);
const Election = mongoose.model('Election', ElectionSchema);
const ElectionCandidate = mongoose.model('ElectionCandidate', ElectionCandidateSchema);
const ElectionOrg = mongoose.model('ElectionOrg', ElectionOrgSchema);
const ElectionResult = mongoose.model('ElectionResult', ElectionResultSchema);



const storage = multer.diskStorage({
  destination: './uploads/', // Directory to save uploaded files
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with unique name
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/; // Accepted file types
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    
    if (extname && mimeType) {
      return cb(null, true);
    }
    cb("Error: Only images are allowed!");
  }
});

// Create an Express app
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"))
app.use('/uploads', express.static('uploads')); // Serve the uploads directory
app.use("/css",express.static("dist"))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

// Optional: Set the views directory (default is 'views')
// MongoDB connection
//mongodb://18.232.124.147:27017/election-monitoring-db-exp

// Utility function to simulate creating election locations in MongoDB
async function createElectionLocation(data) {
  const electionLocation = new ElectionLocation(data);
  await electionLocation.save();
  console.log('Election Location Created:', data);
}

// Seed the database with districts
async function seedLocationDatabaseWithDistricts() {
    const allDistricts = JSON.parse(
      fs.readFileSync('./nigeria_districts_merged.json', { encoding: 'utf-8' })
    );
  
    const code = 'NG'; // Country code
    const lgas = allDistricts['lga_tbl'];
    const wards = allDistricts['ward_tbl'];
    const units = allDistricts['polling_unit_tbl'];
    const senDist = allDistricts['senatorial_district_tbl'];
    const repDist = allDistricts['representative_district_tbl'];
    const states = allDistricts['state_tbl'];
    // Election Location Created: {
    //   name: 'Pevillyaa village - nkst school, pevikyaa (PU: 07/21/09/010)',
    //   country_id: 'NG',
    //   state_id: 'STATE_7',
    //   lga_id: 'LOCAL_GOVERNMENT_139',
    //   senatorial_district_id: 'SENATORIAL_DISTRICT_21',
    //   representative_district_id: 'REPRESENTATIVE_DISTRICT_62',
    //   parentLocationId: 'WARD_1642',
    //   locationType: 'POLLING_UNIT',
    //   _id: 'POLLING_UNIT_21945'
    // }
    // Create Local Governments
    // for (let i = 0; i < lgas.length; i++) {
    //   const lga = lgas[i];
      
    //   await createElectionLocation({
    //     name: lga.lga_name,
    //     country_id: code,
    //     state_id: `${ElectionLocationType.STATE}_${lga.state_id}`,
    //     senatorial_district_id: `${ElectionLocationType.SENATORIAL_DISTRICT}_${lga.senatorial_district_id}`,
    //     representative_district_id: `${ElectionLocationType.REPRESENTATIVE_DISTRICT}_${lga.representative_district_id}`,
    //     parentLocationId: `${ElectionLocationType.STATE}_${lga.state_id}`,
    //     locationType: ElectionLocationType.LOCAL_GOVERNMENT,
    //     _id: `${ElectionLocationType.LOCAL_GOVERNMENT}_${lga.lga_id}`,
    //   });
    // }


    const filteredLgas = lgas.filter(lga => lga.state_id === 29);

for (let i = 0; i < filteredLgas.length; i++) {
  const lga = filteredLgas[i];
  
  await createElectionLocation({
    name: lga.lga_name,
    country_id: code,
    state_id: `${ElectionLocationType.STATE}_${lga.state_id}`,
    senatorial_district_id: `${ElectionLocationType.SENATORIAL_DISTRICT}_${lga.senatorial_district_id}`,
    representative_district_id: `${ElectionLocationType.REPRESENTATIVE_DISTRICT}_${lga.representative_district_id}`,
    parentLocationId: `${ElectionLocationType.STATE}_${lga.state_id}`,
    locationType: ElectionLocationType.LOCAL_GOVERNMENT,
    lga_id: `${ElectionLocationType.LOCAL_GOVERNMENT}_${lga.lga_id}`,
  });
}
  
    // // Create Wards
    // for (let i = 0; i < wards.length; i++) {
    //   const ward = wards[i];
    //   console.log
    //   await createElectionLocation({
    //     name: ward.ward_name,
    //     country_id: code,
    //     state_id: `${ElectionLocationType.STATE}_${ward.state_id}`,
    //     lga_id: `${ElectionLocationType.LOCAL_GOVERNMENT}_${ward.lga_id}`,
    //     senatorial_district_id: `${ElectionLocationType.SENATORIAL_DISTRICT}_${ward.senatorial_district_id}`,
    //     representative_district_id: `${ElectionLocationType.REPRESENTATIVE_DISTRICT}_${ward.representative_district_id}`,
    //     parentLocationId: `${ElectionLocationType.LOCAL_GOVERNMENT}_${ward.lga_id}`,
    //     locationType: ElectionLocationType.WARD,
    //     _id: `${ElectionLocationType.WARD}_${ward.ward_id}`,
    //   });
    // }
  
    // // Create Polling Units
    // for (let i = 0; i < units.length; i++) {
    //   const unit = units[i];
    //   await createElectionLocation({
    //     name: unit.polling_unit_name,
    //     country_id: code,
    //     state_id: `${ElectionLocationType.STATE}_${unit.state_id}`,
    //     lga_id: `${ElectionLocationType.LOCAL_GOVERNMENT}_${unit.lga_id}`,
    //     senatorial_district_id: `${ElectionLocationType.SENATORIAL_DISTRICT}_${unit.senatorial_district_id}`,
    //     representative_district_id: `${ElectionLocationType.REPRESENTATIVE_DISTRICT}_${unit.representative_district_id}`,
    //     parentLocationId: `${ElectionLocationType.WARD}_${unit.ward_id}`,
    //     locationType: ElectionLocationType.POLLING_UNIT,
    //     _id: `${ElectionLocationType.POLLING_UNIT}_${unit.polling_unit_id}`,
    //   });
    // }
  
    // // Create Senatorial Districts
    // for (let i = 0; i < senDist.length; i++) {
    //   const sen = senDist[i];
    //   await createElectionLocation({
    //     name: sen.district_name,
    //     country_id: code,
    //     state_id: `${ElectionLocationType.STATE}_${sen.state_id}`,
    //     locationType: ElectionLocationType.SENATORIAL_DISTRICT,
    //     _id: `${ElectionLocationType.SENATORIAL_DISTRICT}_${sen.district_id}`,
    //     parentLocationId: `${ElectionLocationType.STATE}_${sen.state_id}`,
    //   });
    // }
  
    // // Create Representative Districts
    // for (let i = 0; i < repDist.length; i++) {
    //   const rep = repDist[i];
    //   await createElectionLocation({
    //     name: rep.district_name,
    //     country_id: code,
    //     state_id: `${ElectionLocationType.STATE}_${rep.state_id}`,
    //     locationType: ElectionLocationType.REPRESENTATIVE_DISTRICT,
    //     _id: `${ElectionLocationType.REPRESENTATIVE_DISTRICT}_${rep.district_id}`,
    //     parentLocationId: `${ElectionLocationType.STATE}_${rep.state_id}`,
    //   });
    // }
  
    // Create States
    // for (let i = 0; i < states.length; i++) {
    //   const state = states[i];
    //   await createElectionLocation({
    //     name: state.state_name,
    //     country_id: code,
    //     locationType: ElectionLocationType.STATE,
    //     _id: `${ElectionLocationType.STATE}_${state.state_id}`,
    //     parentLocationId: code,
    //   });
    // }
  
    console.log('Seeding Completed!');
  }
  
app.get("/",async(req,res)=>{
const elec = await ElectionCandidate.find({})
  .populate('org'); 
  res.render("index",{elec})
})

app.get("/create-election",async(req,res)=>{
  let org = await ElectionOrg.find({})
  let candidate = await ElectionCandidate.find({})
  res.render("createElection",{org,candidate})
})
app.get("/create-candidate",async(req,res)=>{
  let org = await ElectionOrg.find({})
  let candidate = await ElectionCandidate.find({})
  res.render("createCandidate",{org,candidate})
})
app.get("/create-org",(req,res)=>{
  res.render("createOrg")
})
app.get("/create-result",async(req,res)=>{
  let org = await ElectionOrg.find({})
  let lga = await ElectionLocation.find({})
  let election = await Election.find({})
  res.render("postResult",{org,lga,election})
})



app.post('/create-org', upload.single('file'), async(req, res) => {
  if (req.file) {
   await ElectionOrg.create({
      name:req.body.name,
      acronym:req.body.acronym,
      file:req.file.path,
    })
    res.redirect("/create-org")
    } else {
    res.send({msg:"error"});
  }
});

app.post('/create-candidate', upload.single('file'), async(req, res) => {
  if (req.file) {
      let orgD = await ElectionOrg.findOne({_id:req.body.org})
   await ElectionCandidate.create({
      full_name:req.body.full_name,
      org:orgD,
      file:req.file.path,
    })
    res.redirect("/create-candidate")
    } else {
    res.send({msg:"error"});
  }
});

app.post('/create-election', async(req, res) => {
  console.log(req.body)
   await  Election.create({
      name:req.body.name,
      type:req.body.type,
      org:req.body.orgs,
      candidates:req.body.candidates,
    })
    res.redirect("/create-election")
});


app.post('/post-result', upload.single('file'), async(req, res) => {
    
    let org = req.body.org.map((orgId, index) => {
      // For each orgId, match the result and default to '0' if empty
      return {
        orgId: orgId,
        result: req.body.result[index] || '0'  // If result is empty, set it to '0'
      };
    })
   await ElectionResult.create({
    election:req.body.election,
    org,
    lga:req.body.lga
   })
   res.redirect("/create-result")
  
})

app.get("/fetch-lga",async (req,res)=>{
  const results = await ElectionResult.aggregate([
    {
      $unwind: '$org' // Unwind the org array to handle each org separately
    },
    {
      $lookup: {
        from: 'electioncandidates',
        let: { orgId: '$org.orgId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$$orgId', '$org._id'] }
            }
          },
          { $project: { _id: 1, org: 1, full_name: 1 } } // Just for debugging
        ],
        as: 'candidates'
      }
    },
    {
      $lookup: {
        from: 'electionorganizations',
        localField: 'org.orgId',
        foreignField: '_id',
        as: 'organizations'
      }
    },
    {
      $lookup: {
        from: 'electionlocations', // Assuming this is the collection for LGAs
        localField: 'lga', // The field from 'ElectionResult' that holds the LGA ID
        foreignField: '_id', // The field from 'electionlocations' collection that holds the LGA ID
        as: 'lgaDetails'
      }
    },
    {
      $addFields: {
        'org.candidates': '$candidates',
        'org.organizationDetails': {
          $arrayElemAt: ['$organizations', { $indexOfArray: ['$organizations._id', '$org.orgId'] }]
        },
        lga: { $arrayElemAt: ['$lgaDetails', 0] }
      }
    },
    { $unset: ['candidates', 'organizations', 'lgaDetails'] }, // Remove temporary fields
    {
      $group: {
        _id: '$_id',
        org: { $push: '$org' },
        lga: { $first: '$lga' },
        totalVotes: { $first: '$totalVotes' },
        election: { $first: '$election' },
        file: { $first: '$file' }
      }
    },
    {
      $addFields: {
        totalVotes: {
          $sum: {
            $map: {
              input: '$org',
              as: 'o',
              in: { $toDouble: { $ifNull: ['$$o.result', 0] } }
            }
          }
        }
      }
    },
    {
      $addFields: {
        org: {
          $map: {
            input: '$org',
            as: 'organization',
            in: {
              $mergeObjects: [
                '$$organization',
                {
                  resultAsDouble: { $toDouble: { $ifNull: ['$$organization.result', 0] } },
                  votePercentage: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: [{ $toDouble: { $ifNull: ['$$organization.result', 0] } }, '$totalVotes'] },
                          100
                        ]
                      },
                      2
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        org: {
          $sortArray: { input: '$org', sortBy: { resultAsDouble: -1 } } // Sort `org` array by result
        }
      }
    },
    {
      $addFields: {
        highestVotes: { $slice: ['$org', 3] } // Extract top 3 highest results
      }
    }
  ]);
  
  
  console.log(results);
  
  
  
  console.log(results);
  
  

     res.send({data:results})
 })
// Trigger the seeding when the server starts
async function seed() {

   console.log("successful")
    console.log(r)
}
//seed()
// Start the Express server

const seedDatabase = async () => {
  try {
    const parties = [
      { name: "Accord", acronym: "A", color: "red" },
      { name: "Action Alliance", acronym: "AA", color: "blue" },
      { name: "Action Democratic Party", acronym: "ADP", color: "green" },
      { name: "Action Peoples Party", acronym: "APP", color: "brown" },
      { name: "African Action Congress", acronym: "AAC", color: "purple" },
      { name: "African Democratic Congress", acronym: "ADC", color: "orange" },
      { name: "All Progressives Congress", acronym: "APC", color: "teal" },
      { name: "All Progressives Grand Alliance", acronym: "APGA", color: "pink" },
      { name: "Allied Peoples Movement", acronym: "APM", color: "gold" },
      { name: "Boot Party", acronym: "BP", color: "cyan" },
      { name: "Labour Party", acronym: "LP", color: "lime" },
      { name: "National Rescue Movement", acronym: "NRM", color: "navy" },
      { name: "New Nigeria Peoples Party", acronym: "NNPP", color: "magenta" },
      { name: "Peoples Democratic Party", acronym: "PDP", color: "violet" },
      { name: "Peoples Redemption Party", acronym: "PRP", color: "olive" },
      { name: "Social Democratic Party", acronym: "SDP", color: "maroon" },
      { name: "Young Progressive Party", acronym: "YPP", color: "aqua" },
      { name: "Youth Party", acronym: "YP", color: "coral" },
      { name: "Zenith Labour Party", acronym: "ZLP", color: "khaki" },
    ];
    
    
    // Function to generate random full names
    const generateRandomFullName = () => {
      const firstNames = ["John", "Mary", "Michael", "Jane", "David", "Sarah", "Peter", "Anne", "Chris", "Emma"];
      const lastNames = ["Smith", "Johnson", "Brown", "Taylor", "Anderson", "Lee", "Martin", "Garcia", "Clark", "White"];
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return `${randomFirstName} ${randomLastName}`;
    };
    

    // Add the default `file` field to each party
    const partiesWithFile = parties.map(party => ({
      ...party,
      file: 'default_file_path',
    }));

    // Insert organizations into the database
    const orgs = await ElectionOrg.insertMany(partiesWithFile);
    console.log('Organizations seeded successfully');

    // Create candidates for each organization
    const candidates = orgs.map(org => ({
      full_name: generateRandomFullName(),
      org: org,
      file: 'uploads/avatar.png'
    }));

    // Insert candidates into the database
    await ElectionCandidate.insertMany(candidates);
    console.log('Candidates seeded successfully');

    // Close the connection
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

// Execute the seed script
//seedDatabase()
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on http://localhost:3000');
});
