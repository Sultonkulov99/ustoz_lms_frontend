async function test() {
  const mentorId = 9;
  const payload = {
    id: mentorId, // Let's try putting ID in the payload
    fullName: "Abdulaziz Test",
    phone: "+998918765432",
    job: "NestJS ultimate trainer",
    experience: 5,
    about: "Best nodeJS back-end course ever!"
  };

  try {
    // Let's test PATH /users/mentor
    const res = await fetch("http://13.212.201.57:9000/api/users/mentor", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    console.log("PATCH /users/mentor status:", res.status);
    console.log("PATCH /users/mentor response:", await res.text());
  } catch (e) {
    console.log("PATCH /users/mentor error:", e.message);
  }

  try {
    // Let's test PATH /users/mentor/9
    const res = await fetch("http://13.212.201.57:9000/api/users/mentor/9", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    console.log("PATCH /users/mentor/9 status:", res.status);
    console.log("PATCH /users/mentor/9 response:", await res.text());
  } catch (e) {
    console.log("PATCH /users/mentor/9 error:", e.message);
  }
}

test();
