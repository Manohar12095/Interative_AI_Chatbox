/**
 * APEX Tool definitions and constants
 */
export const TOOL_DEFINITIONS = [
  { id: "get_weather", name: "Weather", icon: "🌦", description: "Get real-time weather for any city", category: "info" },
  { id: "web_search", name: "Web Search", icon: "🔍", description: "Search the internet for any topic", category: "search" },
  { id: "get_news", name: "News", icon: "📰", description: "Fetch latest news headlines", category: "search" },
  { id: "calculator", name: "Calculator", icon: "🧮", description: "Evaluate math, algebra, calculus", category: "utility" },
  { id: "wikipedia_search", name: "Wikipedia", icon: "🌐", description: "Get Wikipedia article summaries", category: "search" },
  { id: "convert_currency", name: "Currency", icon: "💱", description: "Convert between currencies", category: "utility" },
  { id: "get_stock_price", name: "Stocks", icon: "📈", description: "Get real-time stock prices", category: "info" },
  { id: "generate_qr_code", name: "QR Code", icon: "📌", description: "Generate QR codes for any data", category: "utility" },
  { id: "get_datetime", name: "DateTime", icon: "🕐", description: "Get time in any timezone", category: "utility" },
  { id: "translate_text", name: "Translator", icon: "🌐", description: "Translate text to any language", category: "utility" },
  { id: "get_joke_or_trivia", name: "Jokes", icon: "😄", description: "Get random jokes and trivia", category: "fun" },
  { id: "explain_code", name: "Code Explainer", icon: "💻", description: "Explain code and find bugs", category: "dev" },
  { id: "summarise_text", name: "Summariser", icon: "📝", description: "Summarise long text content", category: "utility" },
  { id: "define_word", name: "Dictionary", icon: "📚", description: "Get word definitions and synonyms", category: "info" },
  { id: "get_ip_info", name: "IP Lookup", icon: "🌐", description: "Get location info for an IP", category: "info" },
];

export const SUGGESTED_PROMPTS = [
  { icon: "🌦", text: "What's the weather in Tokyo right now?" },
  { icon: "📈", text: "What is the stock price of TSLA?" },
  { icon: "🧮", text: "Calculate: integrate(x**3 + 2*x, x)" },
  { icon: "🔍", text: "Search the web for latest AI news" },
  { icon: "💱", text: "Convert 5000 INR to USD" },
  { icon: "😄", text: "Tell me a programming joke" },
  { icon: "📚", text: "Define the word: Ephemeral" },
  { icon: "🌐", text: "Tell me about quantum computing from Wikipedia" },
];

export const API_BASE = import.meta.env.VITE_API_BASE || '';  // Uses Vite proxy in development, customizable via env in production

export const TOPIC_CATEGORIES = [
  {
    category: "Administration & Office",
    topics: [
      "Office Management System", "Document Management System", "File Tracking System",
      "Visitor Management System", "Meeting Room Management System", "Office Asset Management System",
      "Office Automation System", "Employee Leave Management System", "Employee Performance Management System",
      "Workforce Management System"
    ]
  },
  {
    category: "Human Resources",
    topics: [
      "Recruitment Management System", "Interview Scheduling System", "Employee Training Management System",
      "HR Management System", "Staff Allocation System", "Workforce Analytics System",
      "Employee Feedback Management System", "Internship Management System", "Job Portal Management System",
      "Talent Management System"
    ]
  },
  {
    category: "Education",
    topics: [
      "Faculty Management System", "Scholarship Management System", "Student Portal System",
      "Academic Record Management System", "University Admission System", "Classroom Management System",
      "Online Assignment Management System", "Alumni Management System", "School Transport Management System",
      "Digital Learning Management System"
    ]
  },
  {
    category: "Healthcare",
    topics: [
      "Doctor Appointment Booking System", "Hospital Resource Management System", "Ambulance Tracking System",
      "Organ Donation Management System", "Vaccination Management System", "Medical Inventory System",
      "Health Insurance Management System", "Patient Monitoring System", "Telemedicine Management System",
      "Emergency Healthcare System"
    ]
  },
  {
    category: "Banking & Finance",
    topics: [
      "ATM Management System", "Credit Card Management System", "Financial Portfolio Management System",
      "Investment Tracking System", "Tax Management System", "Budget Planning System",
      "Personal Finance Management System", "Digital Wallet Management System", "Stock Portfolio Management System",
      "Mutual Fund Management System"
    ]
  },
  {
    category: "Retail & Sales",
    topics: [
      "Point of Sale (POS) System", "Retail Store Management System", "Supplier Management System",
      "Product Catalog Management System", "Sales Analytics System", "Procurement Management System",
      "Coupon Management System", "Franchise Management System", "Vendor Management System",
      "Retail Inventory Tracker"
    ]
  },
  {
    category: "Hotel & Hospitality",
    topics: [
      "Restaurant Management System", "Catering Management System", "Room Reservation System",
      "Guest Management System", "Food Delivery Management System", "Hotel Booking System",
      "Resort Management System", "Banquet Management System", "Travel Package Management System",
      "Tourism Information System"
    ]
  },
  {
    category: "Transport & Logistics",
    topics: [
      "Fleet Management System", "Courier Tracking System", "Delivery Management System",
      "Smart Traffic Monitoring System", "Ride Sharing Management System", "Taxi Booking System",
      "Cargo Management System", "Transport Scheduling System", "Shipment Tracking System",
      "Fuel Management System"
    ]
  },
  {
    category: "Agriculture",
    topics: [
      "Farm Management System", "Crop Monitoring System", "Livestock Management System",
      "Irrigation Management System", "Agricultural Resource Management System", "Smart Farming System",
      "Fertilizer Management System", "Crop Yield Prediction System", "Agricultural Supply Chain System",
      "Dairy Farm Management System"
    ]
  },
  {
    category: "Security & Safety",
    topics: [
      "Crime Record Management System", "Police Station Management System", "Prison Management System",
      "Fire Emergency Management System", "Disaster Response Management System", "Surveillance Management System",
      "Incident Reporting System", "Security Access Control System", "SOS Alert System",
      "Women Safety Management System"
    ]
  },
  {
    category: "Real Estate",
    topics: [
      "Property Management System", "Rental Management System", "Apartment Management System",
      "Housing Society Management System", "Land Record Management System", "Real Estate Listing System",
      "Tenant Management System", "Building Maintenance System", "Smart Property Portal",
      "Facility Management System"
    ]
  },
  {
    category: "Sports & Entertainment",
    topics: [
      "Sports Club Management System", "Tournament Management System", "Event Ticket Booking System",
      "Movie Reservation System", "Gym Membership Management System", "Athlete Performance Tracking System",
      "Sports Analytics System", "Cultural Event Management System", "Music Event Management System",
      "Esports Tournament Management System"
    ]
  },
  {
    category: "AI-Based Systems",
    topics: [
      "AI Attendance Management System", "AI Interview Evaluation System", "AI Hospital Assistant System",
      "AI Recruitment System", "AI Customer Support System", "AI Legal Assistance System",
      "AI Traffic Management System", "AI Fraud Detection System", "AI Financial Advisor System",
      "AI Academic Advisor System"
    ]
  },
  {
    category: "Smart City Projects",
    topics: [
      "Smart Waste Management System", "Smart Water Management System", "Smart Parking Management System",
      "Smart Electricity Monitoring System", "Smart Street Light Management System", "Smart Pollution Monitoring System",
      "Smart Emergency Response System", "Smart Public Transport System", "Smart City Dashboard",
      "Smart Resource Allocation System"
    ]
  },
  {
    category: "Advanced Enterprise Projects",
    topics: [
      "Enterprise Resource Planning (ERP) System", "Supply Chain Management System", "Business Intelligence System",
      "Knowledge Management System", "Procurement Management System", "Compliance Management System",
      "Risk Management System", "Audit Management System", "Corporate Governance System",
      "Business Process Management System"
    ]
  }
];
