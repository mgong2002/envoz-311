/* ============================================================
   Envoz 311 — shared demo data (fictional; City of Vista Robles, CA)
   Exposed as window.ENVOZ_DATA
   ============================================================ */
window.ENVOZ_DATA = {
  demoCity: "City of Vista Robles, California",
  onboardingCity: "Harbor Mesa, California",
  demoNumber: "311 / (949) 555-0311",

  departments: [
    "Public Works", "Sanitation", "Utilities", "Parks Maintenance",
    "Code Enforcement", "Transportation", "Animal / Vector Control", "County Partner"
  ],

  neighborhoods: [
    "Alton District", "Harbor View", "Oak Bluff", "Paseo Market Corridor",
    "Mesa Ridge", "Civic Center", "North Foothills", "School Zone South"
  ],

  cases: [
    {
      id: "VR-4281", type: "Pothole / Road Hazard", location: "Alton Pkwy & Irvine Center Dr",
      neighborhood: "Alton District", confidence: 92, priority: "High", dept: "Public Works",
      status: "New", action: "Approve", queue: "New", channel: "Voice · after-hours",
      time: "9:44 PM", proof: "Case number issued by SeeClickFix at 9:44 PM",
      rationale: "Road hazard near ramp access on city-maintained roadway.",
      summary: "Resident hit a large pothole near the Alton ramp and almost swerved into another lane. No injuries. Hazard to evening traffic.",
      transcript: [
        ["Resident", "I hit a huge pothole near the Alton ramp and almost swerved."],
        ["Nico", "I can help report that. First, is anyone hurt or in immediate danger?"],
        ["Resident", "No, everyone's fine — but it's really deep."],
        ["Nico", "Glad you're safe. Is this closer to Irvine Center Drive or Mesa Ridge?"],
        ["Resident", "Irvine Center Drive, right by the ramp."]
      ],
      fields: { surface: "Asphalt, arterial", lane: "Right lane, NB", size: "Reported ~2 ft", injury: "None reported" },
      related: ["VR-4262 · Pothole · 0.4 mi north · resolved Jun 12"],
      sla: "48h assessment · 21h remaining", sources: ["GIS road ownership layer", "SeeClickFix write API"]
    },
    {
      id: "VR-4293", type: "Illegal Dumping / Bulk Waste", location: "Paseo Market alley",
      neighborhood: "Paseo Market Corridor", confidence: 91, priority: "Normal", dept: "Sanitation",
      status: "New", action: "Approve", queue: "New", channel: "Voice",
      time: "7:12 AM", proof: "Case number issued by SeeClickFix at 7:14 AM",
      rationale: "Bulk items on public right-of-way; matches dumping pattern behind commercial corridor.",
      summary: "Mattress and several trash bags dumped in the alley behind Paseo Market. Blocking one parking space.",
      transcript: [
        ["Resident", "Somebody dumped a mattress and bags behind Paseo Market again."],
        ["Nico", "Thanks for reporting it. Is it blocking traffic or a doorway?"],
        ["Resident", "Just a parking spot in the alley."]
      ],
      fields: { items: "Mattress, ~6 bags", access: "Alley, public ROW", blocking: "1 parking space" },
      related: ["VR-4201 · Dumping, same alley · Jun 28", "VR-4144 · Dumping, same alley · Jun 14"],
      sla: "72h removal · 60h remaining", sources: ["SeeClickFix write API"]
    },
    {
      id: "VR-4314", type: "Fallen Tree", location: "Harbor View Park, east trail",
      neighborhood: "Harbor View", confidence: 87, priority: "High", dept: "Parks Maintenance",
      status: "Needs Review", action: "Review", queue: "Needs Review", channel: "Voice",
      time: "6:02 AM", proof: "Case number issued by SeeClickFix at 6:03 AM",
      rationale: "Tree blocking public trail inside park boundary; parks asset layer match.",
      summary: "Large eucalyptus down across the east trail after overnight wind. Trail fully blocked; no wires involved.",
      transcript: [
        ["Resident", "There's a big tree down across the trail at Harbor View Park."],
        ["Nico", "Is the tree touching any power lines, or is anyone trapped or hurt?"],
        ["Resident", "No wires, nobody hurt. It's just blocking the whole trail."]
      ],
      fields: { species: "Eucalyptus (est.)", wires: "None", trailBlocked: "Yes, fully" },
      related: ["VR-4311 · Branch down, Harbor View picnic area · 5:40 AM"],
      sla: "24h clearance · 18h remaining", sources: ["Parks asset layer", "SeeClickFix write API"]
    },
    {
      id: "VR-4317", type: "Water Pooling", location: "Oak Bluff Dr near storm drain #SD-2214",
      neighborhood: "Oak Bluff", confidence: 76, priority: "Normal", flag: "SLA Risk", dept: "Utilities?",
      status: "SLA Risk", action: "Reroute", queue: "SLA Risk", channel: "Voice",
      time: "8:20 PM", proof: "Case number issued by SeeClickFix at 8:22 PM",
      rationale: "Initially routed to Streets; pooling within 30 ft of storm-drain asset suggests Utilities per city correction history.",
      summary: "Standing water pooling at the curb near a storm drain, not draining after dry weather. Possible drain backup.",
      transcript: [
        ["Resident", "There's water pooling on Oak Bluff Drive and it hasn't rained in days."],
        ["Nico", "Is the water near a storm drain or in the middle of the roadway?"],
        ["Resident", "Right at the curb, next to the drain grate."]
      ],
      fields: { extent: "~15 ft along curb", nearAsset: "Storm drain SD-2214 (28 ft)", weather: "Dry 6 days" },
      related: ["19 similar cases corrected Streets → Utilities in 90 days"],
      sla: "48h assessment · 6h remaining — at risk", sources: ["GIS storm-drain asset layer"]
    },
    {
      id: "VR-4320", type: "Unknown / Beehive in Bus Shelter", location: "Jeffrey Transit Stop",
      neighborhood: "School Zone South", confidence: 41, priority: "Normal", flag: "Needs Review", dept: "Unknowns",
      status: "Needs Review", action: "Route", queue: "Unknowns", channel: "Voice",
      time: "3:45 PM", proof: "Filed as other_unknown · VR-4320 issued · awaiting human re-type",
      rationale: "No confident taxonomy match; three candidates below the 0.60 routing threshold. Filed as other_unknown so a case number is always issued, then re-typed from the Unknowns queue.",
      summary: "Resident reports a basketball-sized beehive inside the bus shelter at Jeffrey Transit Stop. Active bees; shelter in daily use.",
      transcript: [
        ["Resident", "There's a basketball-sized beehive in the bus shelter."],
        ["Nico", "Thanks — is anyone being stung or having an allergic reaction right now?"],
        ["Resident", "No, people are just avoiding the shelter."]
      ],
      fields: { size: "~Basketball", activity: "Active", structure: "Transit shelter (city asset)", caseState: "other_unknown" },
      candidates: [["Parks Maintenance", 41], ["Code Enforcement", 33], ["Animal / Vector Control", 29]],
      related: [], sla: "Human review today · set by tenant config", sources: ["SeeClickFix write API"]
    },
    {
      id: "VR-4330", type: "Streetlight Outage", location: "School Zone South crosswalk, Maple & 3rd",
      neighborhood: "School Zone South", confidence: 89, priority: "Normal", dept: "Transportation",
      status: "New", action: "Approve", queue: "New", channel: "Voice · Spanish",
      time: "8:51 PM", proof: "Case number issued by SeeClickFix at 8:53 PM",
      rationale: "City-owned luminaire at school crosswalk; elevated priority due to school-zone flag.",
      summary: "Streetlight out at the crosswalk by the elementary school. Reported in Spanish; crossing is dark during evening pickup.",
      transcript: [
        ["Resident", "La luz de la calle está apagada en el cruce de la escuela."],
        ["Nico", "Gracias por avisar. ¿Está cerca de la escuela primaria en Maple y la calle 3?"],
        ["Resident", "Sí, justo en el cruce peatonal."]
      ],
      fields: { pole: "TL-0921 (city-owned)", schoolZone: "Yes", language: "Spanish · confidence 94%" },
      related: [], sla: "5 business days · on track", sources: ["Streetlight asset layer", "SeeClickFix write API"]
    },
    {
      id: "VR-4337", type: "Abandoned Vehicle", location: "Mesa Ridge Rd, block 400",
      neighborhood: "Mesa Ridge", confidence: 83, priority: "Normal", dept: "Code Enforcement",
      status: "Needs Review", action: "Review", queue: "Needs Review", channel: "Web",
      time: "11:05 AM", proof: "Case number issued by SeeClickFix at 11:05 AM",
      rationale: "Vehicle stationary 9+ days per resident; 72-hour ordinance applies on public street.",
      summary: "Sedan with flat tires parked in the same spot for over a week. Registration appears expired.",
      transcript: [["Resident", "A car has been sitting on our street for more than a week with flat tires."]],
      fields: { vehicle: "Gray sedan", condition: "2 flat tires", duration: "9 days reported" },
      related: [], sla: "72h tag-and-notice · on track", sources: ["SeeClickFix write API"]
    },
    {
      id: "VR-4342", type: "Storm Drain Burbling", location: "Oak Bluff Dr & Canyon Way",
      neighborhood: "Oak Bluff", confidence: 64, priority: "Normal", flag: "Surge Cluster", dept: "Public Works?",
      status: "Needs Review", action: "Review", queue: "Unknowns", channel: "Voice · after-hours",
      time: "10:31 PM", proof: "Case number issued by SeeClickFix at 10:33 PM",
      rationale: "Routed to Public Works on a 0.64 match, then held by the surge-cluster monitor: 14 “storm grate burbling” reports in 48h are likely one event, not fourteen cases.",
      summary: "Resident reports gurgling sound and slow backflow at a storm grate during rain. Part of a 14-report cluster in Oak Bluff.",
      transcript: [
        ["Resident", "The storm grate on our corner is burbling and water's coming back up."],
        ["Nico", "Is water entering any home or garage right now?"],
        ["Resident", "No, it's staying in the gutter so far."]
      ],
      fields: { cluster: "Oak Bluff storm cluster (14 reports)", backflow: "Minor, gutter only" },
      related: ["13 similar reports within 0.5 mi in 48h — likely one event"],
      sla: "Surge triage · monitoring", sources: ["Surge clustering model"]
    }
  ],

  ledger: [
    { date: "Jul 2", signal: "Staff correction", evidence: "19 water-pooling reroutes",
      change: "Add storm-drain proximity rule", scope: "City-only", status: "Ready for approval",
      impact: "-14% reroutes", audit: "CEL-1042" },
    { date: "Jul 3", signal: "Language audit", evidence: "Spanish calls near schools",
      change: "Add local landmark vocabulary", scope: "Department memory", status: "In sandbox",
      impact: "+11% address confidence", audit: "CEL-1043" },
    { date: "Jul 4", signal: "Surge pattern", evidence: "“storm grate burbling” cluster",
      change: "Add storm-drain backup subcategory", scope: "City taxonomy", status: "Approved",
      impact: "Faster winter triage", audit: "CEL-1044" },
    { date: "Jul 5", signal: "Connector health", evidence: "SeeClickFix API retry spike",
      change: "Adjust retry window", scope: "Tenant config", status: "Completed",
      impact: "No duplicate confirmations", audit: "CEL-1045" },
    { date: "Jul 6", signal: "Knowledge gap", evidence: "Trash schedule ambiguity",
      change: "Normalize neighborhood names", scope: "Data quality", status: "Assigned",
      impact: "Lower escalation rate", audit: "CEL-1046" }
  ],

  recommendations: [
    {
      id: "rec-storm-drain", title: "Create city-only routing rule", status: "Ready for approval",
      evidence: "19 water-pooling cases were corrected from Streets to Utilities.",
      action: "Add storm-drain proximity rule: when water pooling is reported within 30 feet of a storm-drain asset, route to Utilities unless the resident mentions pavement damage.",
      impact: "14% fewer reroutes", owner: "Public Works + Utilities", risk: "Low",
      scope: "City-only rule", sampleCases: ["VR-4317", "VR-4298", "VR-4276"],
      buttons: ["Test in sandbox", "Approve rule", "Assign review"]
    },
    {
      id: "rec-spanish-vocab", title: "Add Spanish landmark vocabulary", status: "Open",
      evidence: "Spanish calls near School Zone South have lower address confidence.",
      action: "Add local school nicknames and crosswalk landmarks to the Spanish location-resolution vocabulary.",
      impact: "+11% address confidence", owner: "311 manager", risk: "Low",
      scope: "Department memory", sampleCases: ["VR-4330"],
      buttons: ["Add vocabulary", "Review examples"]
    },
    {
      id: "rec-trash-data", title: "Fix trash schedule data quality", status: "Open",
      evidence: "17 inconsistent neighborhood names imported from Google Sheets.",
      action: "Normalize neighborhood names before production launch.",
      impact: "Fewer grounded-answer escalations", owner: "Sanitation", risk: "Low",
      scope: "Data quality", sampleCases: [],
      buttons: ["Create cleanup task list", "Continue sandbox only"]
    },
    {
      id: "rec-storm-subcat", title: "Create storm-drain service subcategory", status: "Ready for approval",
      evidence: "“Storm grate burbling” appeared 14 times during surge.",
      action: "Add provisional subcategory for winter storm season.",
      impact: "Faster triage during weather events", owner: "Public Works", risk: "Medium",
      scope: "City taxonomy", sampleCases: ["VR-4342"],
      buttons: ["Add to taxonomy", "Send to review"]
    },
    {
      id: "rec-council-report", title: "Update council proof report", status: "Ready for approval",
      evidence: "After-hours coverage, routing accuracy, and SLA compliance improved this quarter.",
      action: "Generate a 90-day council-ready modernization report.",
      impact: "City manager can demonstrate measurable resident-service gains.",
      owner: "City Manager’s Office", risk: "Low",
      scope: "Reporting", sampleCases: [],
      buttons: ["Generate report", "Share draft"]
    },
    {
      id: "rec-sla-threshold", title: "Adjust parks SLA-risk threshold", status: "Open",
      evidence: "Parks cases in Harbor View trend 22% slower than citywide median.",
      action: "Alert supervisors when Harbor View parks cases reach 60% of SLA window.",
      impact: "Earlier intervention on at-risk cases", owner: "Parks Maintenance", risk: "Low",
      scope: "Tenant config", sampleCases: ["VR-4314"],
      buttons: ["Test in sandbox", "Assign review"]
    }
  ],

  successMetrics: {
    coverage: "100%", answeredBeforeSecondRing: "98.7%", avgHold: "0:04",
    containment: "76%", requestsCreated: "1,248", avgHandle: "2:18",
    routingAccuracy: "91.6%", slaCompliance: "93.4%", costPerInteraction: "$0.50",
    staffHoursSaved: "312", csat: "4.6 / 5", languages: "18",
    afterHoursCaptured: "327", unknownRate: "3.8%"
  },

  gaps: [
    { title: "Repeated storm-drain phrasing not in taxonomy",
      evidence: "14 “storm grate burbling” reports in 48h fell below routing threshold.",
      suggestion: "Add storm-drain backup subcategory for winter season.",
      impact: "Faster surge triage", owner: "Public Works", risk: "Medium",
      cta: "Create rule" },
    { title: "Spanish address-confidence issue near school zones",
      evidence: "Spanish-language calls near School Zone South resolve addresses at 71% vs 82% citywide.",
      suggestion: "Add local school nicknames and crosswalk landmarks.",
      impact: "+11% address confidence", owner: "311 manager", risk: "Low",
      cta: "Add to configuration" },
    { title: "Parks SLA delay in Harbor View",
      evidence: "Harbor View parks cases run 22% slower than citywide median.",
      suggestion: "Add early SLA-risk alert at 60% of window.",
      impact: "Earlier supervisor intervention", owner: "Parks Maintenance", risk: "Low",
      cta: "Open queue" },
    { title: "Bulk waste mis-pins behind Paseo Market",
      evidence: "6 dumping reports pinned to storefronts instead of the service alley.",
      suggestion: "Add alley alias to location vocabulary for the corridor.",
      impact: "Fewer field-crew callbacks", owner: "Sanitation", risk: "Low",
      cta: "Add to configuration" },
    { title: "Water pooling routed to Streets but corrected to Utilities",
      evidence: "19 corrections in 90 days near storm-drain assets.",
      suggestion: "Create storm-drain proximity routing rule.",
      impact: "-14% reroutes", owner: "Public Works + Utilities", risk: "Low",
      cta: "Create rule" },
    { title: "Oak Bluff storm debris cluster likely one event",
      evidence: "13 related reports within 0.5 mi in 48h.",
      suggestion: "Offer follower status on the parent case instead of new cases.",
      impact: "Cleaner queue during surges", owner: "Public Works", risk: "Low",
      cta: "Export for council" }
  ],

  agent: {
    status: "Drawing on CEL evidence", lastReview: "Today, 7:12 AM",
    focus: "Reducing storm-drain misroutes before winter surge",
    confidence: "89%", openRecs: 6, readyForApproval: 3,
    nextCouncilUpdate: "Friday"
  }
};
