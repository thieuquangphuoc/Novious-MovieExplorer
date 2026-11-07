import { NavLink } from 'react-router-dom';

const navbarContent = [
    { path: "/", title: "Home" },
    { path: "/discover", title: "Discover" },
    { path: "/quiz", title: "Quiz" },
    { path: "/insights", title: "Insights" }
];

/*
 * Thanh điều hướng.
 *
 * Nền cùng màu #141414 với trang và hero nên nhìn liền một khối; chỉ có
 * một đường viền mờ phía dưới để tách khỏi nội dung. sticky top-0 giữ nó
 * luôn ở trên khi cuộn, backdrop-blur làm ảnh phía sau mờ đi khi trôi qua.
 *
 * NavLink cho sẵn isActive, dùng để tô đỏ đúng mục của trang đang mở —
 * người xem luôn biết mình đang ở đâu.
 *
 * Ở màn hình hẹp hai hàng xếp dọc; từ sm trở lên mới nằm ngang. Trước đây
 * ép nằm ngang ở mọi khổ nên trên điện thoại logo dính liền vào menu.
 */
export const NavBar = () => {
    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#141414]/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between sm:px-6 sm:py-4 lg:px-8">
                <NavLink
                    to="/"
                    className="font-display text-3xl tracking-[0.15em] text-white transition-colors hover:text-[#E50914]"
                >
                    NOVIOUS
                </NavLink>

                <div className="flex items-center gap-5 sm:gap-8">
                    {navbarContent.map((item) => {
                        return (
                            <NavLink
                                to={item.path}
                                key={item.path}
                                className={({ isActive }) =>
                                    `text-sm font-medium tracking-wide transition-colors hover:text-[#E50914] ${
                                        isActive ? "text-[#E50914]" : "text-neutral-300"
                                    }`
                                }
                            >
                                {item.title}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
