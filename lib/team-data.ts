export type Member = { name: string; role: string; grade?: string; bio?: string };

export const leadership: Member[] = [
  { name: "Arar Mutlag Alajmi", role: "President", bio: "Leads the council." },
  { name: "Rayyan Nawwab", role: "Vice President", bio: "Supports the President." },
  { name: "Omar Al-Ajjuri", role: "Events Coordinator", bio: "Plans events." },
  { name: "Khalid Walid Alismail", role: "Advisor", bio: "Guides the council." },
];

export const departments: { name: string; heads: Member[]; members: Member[] }[] = [
  { name: "IT",
    heads: [{ name: "Abdulrahman Turkestani", role: "Head of IT 1" }, { name: "Shayan Saeed", role: "Head of IT 2" }],
    members: [{ name: "Rayan Nasser Dasta", role: "Co Head" }, { name: "Moaz Ahmed Aldewainy", role: "Member" }] },
  { name: "Activities",
    heads: [{ name: "Suleiman Banday", role: "Head 1" }, { name: "Abdullah Zeeshan", role: "Head 2" }],
    members: [{ name: "Bilal Mohannad Alkudwah", role: "Co Head" }, { name: "Abdullah Saad Baqai", role: "Member" }] },
  { name: "Clubs",
    heads: [{ name: "Syed Mubashir Hussain", role: "Head 1" }, { name: "Omar Fahim Syed", role: "Head 2" }],
    members: [{ name: "Bilal Bahaa Eddin Al Hakeem", role: "Co Head" }, { name: "Mohammed Abdullah Alkhaibari", role: "Member" }] },
  { name: "Finance",
    heads: [{ name: "Ghassan Amir Elhassan", role: "Head 1" }, { name: "Muhammad Humayun Naveed", role: "Head 2" }],
    members: [{ name: "Faris Thamer Alquthami", role: "Co Head" }, { name: "Talal Muffareh Nahari", role: "Member" }] },
  { name: "Volunteering",
    heads: [{ name: "Hassan Husham Hassan Mohammed", role: "Head 1" }, { name: "Ahmed Alaa", role: "Head 2" }],
    members: [{ name: "Ahmad Yasser Alsaqabi", role: "Co Head" }, { name: "Razyn Alharbi", role: "Member" }] },
  { name: "Media and PR",
    heads: [{ name: "Fayed Abdulkareem", role: "Head 1" }, { name: "Ayaan Fahad", role: "Head 2" }],
    members: [{ name: "Abdulrahman Faisal Alturki", role: "Co Head" },{name: "Ahmed Jamiel", role: "Co Head"} ,{ name: "Abdulkareem Abdul Rahman Al Eissa", role: "Member" }] },
  { name: "Newsletter",
    heads: [{ name: "Abdullah Habibullah Chaudhary", role: "Editor in Chief" }],
    members: [
      { name: "Mohammed Nagi Omar", role: "Senior Editor" },
      { name: "Mohammad Bander", role: "Senior Reporter" },
      { name: "Aley Basem Osama", role: "Senior Reporter" },
      { name: "Abdulaziz Osama Alhamad", role: "Junior Writer" },
    ] },
  { name: "Photography",
    heads: [{ name: "Ghassan Yousef Alshayeb", role: "Head 1" }, { name: "Ammar Anwar", role: "Head 2" }],
    members: [
      { name: "Hamad Watban M Altabayanawy", role: "Co Head" },
      { name: "Mustafa Mohammed Farook Badiuddin", role: "Member" },
      { name: "Nawaf Ramy Alduraihem", role: "Member" },
    ] },
];

export const classReps: Member[] = [
  { name: "Naif Bin Hisham Alessa", role: "", grade: "G10AM" },
  { name: "Zayd Mir", role: "", grade: "G10BR" },
  { name: "Yassin Waleed Shawky", role: "", grade: "G11AM" },
  { name: "Mustapha Mohamad Elchami", role: "", grade: "G11BR" },
  { name: "Abdulaziz Ayad Yousef Aldaijy", role: "", grade: "G12AM" },
  { name: "Mekael Usman Mahmood", role: "", grade: "G12BR" },
];