/*
 * Mười câu hỏi trắc nghiệm về phim nổi tiếng.
 *
 * Tách riêng khỏi Quiz.jsx để component chỉ lo phần hiển thị và trạng thái,
 * còn dữ liệu nằm một chỗ dễ sửa — cùng tinh thần với services/api.js.
 *
 * answer là chỉ số (0-3) của đáp án đúng trong mảng options.
 */
const questions = [
  {
    question: "Đạo diễn nào thực hiện bộ phim Inception (2010)?",
    options: ["Christopher Nolan", "Denis Villeneuve", "Ridley Scott", "David Fincher"],
    answer: 0,
  },
  {
    question: "Bộ phim nào giành giải Oscar Phim hay nhất năm 2020?",
    options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
    answer: 2,
  },
  {
    question: "Trong The Matrix (1999), Neo được đề nghị chọn viên thuốc màu gì để biết sự thật?",
    options: ["Xanh lá", "Đỏ", "Xanh dương", "Vàng"],
    answer: 1,
  },
  {
    question: "Ai thủ vai Vito Corleone trong The Godfather (1972)?",
    options: ["Al Pacino", "Robert De Niro", "Marlon Brando", "James Caan"],
    answer: 2,
  },
  {
    question: "Studio nào sản xuất Spirited Away (2001)?",
    options: ["Studio Ghibli", "Toei Animation", "Madhouse", "Kyoto Animation"],
    answer: 0,
  },
  {
    question: "Bộ phim nào mở đầu Vũ trụ Điện ảnh Marvel?",
    options: ["Thor", "Captain America: The First Avenger", "The Incredible Hulk", "Iron Man"],
    answer: 3,
  },
  {
    question: "Con tàu trong Titanic (1997) đâm phải thứ gì?",
    options: ["Tảng băng trôi", "Đá ngầm", "Tàu ngầm", "Một con tàu khác"],
    answer: 0,
  },
  {
    question: "Nhân vật Jack Sparrow xuất hiện trong loạt phim nào?",
    options: ["Pirates of the Caribbean", "Treasure Island", "Master and Commander", "The Goonies"],
    answer: 0,
  },
  {
    question: "Phim Interstellar (2014) xoay quanh hành trình đi qua cái gì?",
    options: ["Cỗ máy thời gian", "Hố sâu vũ trụ (wormhole)", "Cổng dịch chuyển", "Giấc mơ"],
    answer: 1,
  },
  {
    question: "Ai sáng tác nhạc nền cho Star Wars và Jurassic Park?",
    options: ["Hans Zimmer", "Ennio Morricone", "John Williams", "Howard Shore"],
    answer: 2,
  },
];

export default questions;
