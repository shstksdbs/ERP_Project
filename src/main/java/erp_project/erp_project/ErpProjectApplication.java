package erp_project.erp_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan("erp_project.erp_project.entity")
@EnableJpaRepositories("erp_project.erp_project.repository")
public class ErpProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(ErpProjectApplication.class, args);
	}

}
