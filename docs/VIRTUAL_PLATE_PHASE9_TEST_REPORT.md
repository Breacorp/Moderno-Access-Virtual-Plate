# VIRTUAL_PLATE_PHASE9_TEST_REPORT.md

- Pruebas HTTP verificadas contra `https://moderno-access-virtual-plate.vercel.app/`:
  - `if.cgi?type=go_log_page` -> `HTTP 302 -> AccLog.htm`
  - `if.cgi?type=go_user_page` -> `HTTP 302 -> database.htm`
  - `if.cgi?type=want_emp&id=0` -> `HTTP 302 -> EmpRcd.htm`
  - `man.cgi?type=want_door&id=0` -> `HTTP 302 -> DSet.htm`

