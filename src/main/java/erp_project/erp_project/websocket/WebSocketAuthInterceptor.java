package erp_project.erp_project.websocket;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // 연결 시 헤더에서 지점 ID 추출
            String branchId = accessor.getFirstNativeHeader("branch-id");
            
            if (branchId != null) {
                // 지점 ID를 Principal에 저장하여 인증 정보로 사용
                Principal principal = new BranchPrincipal(branchId);
                accessor.setUser(principal);
            }
        }
        
        return message;
    }

    // 지점 정보를 담는 Principal 클래스
    public static class BranchPrincipal implements Principal {
        private final String branchId;

        public BranchPrincipal(String branchId) {
            this.branchId = branchId;
        }

        @Override
        public String getName() {
            return branchId;
        }

        public String getBranchId() {
            return branchId;
        }
    }
}
