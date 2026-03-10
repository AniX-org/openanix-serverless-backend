// хук добавляет кастомные роли к профилю
import Roles from "../json/userRoles.json" with {"type": "json"};

const priority = 0;

function match(url: URL, method: "GET" | "POST"): boolean {
  const pathRe = /\/profile\/\d+/;
  return pathRe.test(url.pathname) && method == "GET";
}

async function hook(data: any, _: URL, __: "GET" | "POST") {
  // проверяем что есть поле 'profile' и к ID профиля привязаны роли
  // иначе возвращаем оригинальные данные
  if (!data.hasOwnProperty("profile") || !data.profile) return data;
  if (!Roles.user_roles.hasOwnProperty(data.profile.id)) return data;

  // ищём и добавляем роли
  // @ts-ignore
  Roles.user_roles[data.profile.id].forEach((element: number) => {
    const role = Roles.roles.find((role: any) => role.id == element);
    if (role) data.profile.roles.push(role);
  });

  // возвращаем изменённые данные
  return data;
}

const entrypoint = { priority, match, hook };
export default entrypoint;
