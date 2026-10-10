package com.novachat.ai.security;

import com.novachat.ai.model.User;
import com.novachat.ai.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        String clean = usernameOrEmail != null ? usernameOrEmail.trim() : "";
        User user = userRepository.findByUsernameIgnoreCase(clean)
                .or(() -> userRepository.findByEmailIgnoreCase(clean))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email: " + clean));

        return new CustomUserDetails(user);
    }
}
