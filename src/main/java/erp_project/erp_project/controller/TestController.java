package erp_project.erp_project.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {
    
    @GetMapping
    public String test() {
        return "API 서버가 정상적으로 작동하고 있습니다!";
    }
    
    @GetMapping("/materials")
    public String testMaterials() {
        return "materials API 엔드포인트가 정상적으로 작동하고 있습니다!";
    }
}
