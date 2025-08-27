package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;
    
    @Column(name = "name", length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "yield_quantity", precision = 10, scale = 2)
    private BigDecimal yieldQuantity;
    
    @Column(name = "yield_unit", length = 20)
    private String yieldUnit;
    
    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;
    
    @Column(name = "preparation_time")
    private Integer preparationTime;
    
    @Column(name = "cooking_time")
    private Integer cookingTime;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", length = 20)
    private RecipeDifficulty difficulty;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private RecipeStatus status;
    
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> ingredients = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = RecipeStatus.ACTIVE;
        }
        if (difficulty == null) {
            difficulty = RecipeDifficulty.MEDIUM;
        }
        if (yieldQuantity == null) {
            yieldQuantity = BigDecimal.ONE;
        }
        if (yieldUnit == null) {
            yieldUnit = "잔";
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum RecipeDifficulty {
        EASY, MEDIUM, HARD
    }
    
    public enum RecipeStatus {
        ACTIVE, INACTIVE
    }
}
