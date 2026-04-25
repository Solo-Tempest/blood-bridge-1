const BASE_URL = "http://localhost:8080/api/auth";
const API_URL  = "http://localhost:8080/api";

const GENDER_MAP = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
  "Prefer not to say": "OTHER",
};

const BLOOD_GROUP_MAP = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

async function parseError(res) {
  try {
    const data = await res.json();
    if (data.message) return data.message;
    if (data.errors) return Object.values(data.errors).join(", ");
    return "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function donorLogin(identifier, password) {
  const res = await fetch(`${BASE_URL}/donor/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function sendDonorOtp(phone) {
  const res = await fetch(`${BASE_URL}/donor/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function verifyDonorOtp(phone, otp) {
  const res = await fetch(`${BASE_URL}/donor/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateDonorProfile(token, body) {
  const res = await fetch(`${API_URL}/donor/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getDonorProfile(token) {
  const res = await fetch(`${API_URL}/donor/me`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function hospitalLogin(identifier, password) {
  const res = await fetch(`${BASE_URL}/hospital/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function sendHospitalOtp(phone) {
  const res = await fetch(`${BASE_URL}/hospital/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function verifyHospitalOtp(phone, otp) {
  const res = await fetch(`${BASE_URL}/hospital/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function hospitalRegister(fd) {
  const phone = fd.contact.phone.replace(/\D/g, "").slice(-10);
  const body = {
    name:        fd.basic.name,
    regNo:       fd.basic.regNo,
    type:        fd.basic.type,
    year:        Number(fd.basic.year),
    website:     fd.basic.website,
    street:      fd.location.street,
    area:        fd.location.area,
    city:        fd.location.city,
    state:       fd.location.state,
    pincode:     fd.location.pincode,
    landmark:    fd.location.landmark,
    lat:         fd.location.lat,
    lng:         fd.location.lng,
    contactName: fd.contact.contactName,
    contactRole: fd.contact.role,
    phone,
    altPhone:    fd.contact.altPhone,
    email:       fd.contact.email,
    hasBloodBank: fd.facilities.hasBloodBank,
    bbLicense:   fd.facilities.bbLicense,
    open24x7:    fd.facilities.is24x7,
    openTime:    fd.facilities.openTime,
    closeTime:   fd.facilities.closeTime,
    beds:        fd.facilities.beds ? Number(fd.facilities.beds) : null,
    icuBeds:     fd.facilities.icuBeds ? Number(fd.facilities.icuBeds) : null,
    password:    fd.account.password,
  };
  const res = await fetch(`${BASE_URL}/hospital/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function donorRegister({ personal, medical, location }) {
  const rawPhone = personal.phone.replace(/\D/g, "");
  const phone = rawPhone.startsWith("91") && rawPhone.length === 12
    ? rawPhone.slice(2)
    : rawPhone.slice(-10);

  const body = {
    fullName: personal.name,
    email: personal.email,
    phone,
    password: personal.password,
    dateOfBirth: personal.dob,
    gender: GENDER_MAP[personal.gender],
    bloodGroup: BLOOD_GROUP_MAP[medical.bloodGroup],
    weight: Number(medical.weight),
    lastDonationDate: medical.neverDonated || !medical.lastDonation ? null : medical.lastDonation,
    city: location.city,
    state: location.state,
    pincode: location.pincode,
  };

  const res = await fetch(`${BASE_URL}/donor/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
