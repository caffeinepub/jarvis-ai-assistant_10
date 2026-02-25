import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // User structures and types
  public type UserProfile = {
    username : Text;
    email : Text;
    password : Text;
    wakeWord : Text;
    language : Text;
    mode : Text; // "personal" or "professional"
    mentor : Text;
    conversationMemory : [Text];
  };

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent store for profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── Required profile API ────────────────────────────────────────────────────

  // Get the caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  // Save / overwrite the caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  // Get any user's profile — caller may only view their own unless they are admin
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ── Registration ────────────────────────────────────────────────────────────

  // Guests (anonymous principals) may register — no permission check required
  public shared ({ caller }) func register(username : Text, email : Text, password : Text) : async Text {
    switch (userProfiles.get(caller)) {
      case (?_) { Runtime.trap("Account already exists for this principal") };
      case (null) {};
    };

    let newProfile : UserProfile = {
      username;
      email;
      password;
      wakeWord = "Jarvis";
      language = "English";
      mode = "personal";
      mentor = "Rengoku Kojiro";
      conversationMemory = [];
    };

    userProfiles.add(caller, newProfile);
    "Successfully registered";
  };

  // ── Login ───────────────────────────────────────────────────────────────────

  // Guests may attempt login — no permission check required
  public query ({ caller }) func login(email : Text, password : Text) : async UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Account not found") };
      case (?profile) {
        if (profile.password != password) {
          Runtime.trap("Invalid credentials");
        };
        profile;
      };
    };
  };

  // ── Settings updates (users only) ───────────────────────────────────────────

  // Update wake word
  public shared ({ caller }) func setWakeWord(newWakeWord : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update wake word");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = { profile with wakeWord = newWakeWord };
        userProfiles.add(caller, updatedProfile);
      };
    };
    "Wake word updated successfully";
  };

  // Update language preference
  public shared ({ caller }) func setLanguage(newLanguage : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update language");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = { profile with language = newLanguage };
        userProfiles.add(caller, updatedProfile);
      };
    };
    "Language preference updated";
  };

  // Update mode (personal / professional)
  public shared ({ caller }) func setMode(newMode : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mode");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = { profile with mode = newMode };
        userProfiles.add(caller, updatedProfile);
      };
    };
    "Mode updated successfully";
  };

  // Update mentor character
  public shared ({ caller }) func setMentor(newMentor : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mentor");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = { profile with mentor = newMentor };
        userProfiles.add(caller, updatedProfile);
      };
    };
    "Mentor updated successfully";
  };

  // ── Conversation memory (users only) ────────────────────────────────────────

  // Append a new entry to the caller's conversation memory
  public shared ({ caller }) func saveConversationEntry(entry : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save memory");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedMemory = profile.conversationMemory.concat([entry]);
        let updatedProfile = { profile with conversationMemory = updatedMemory };
        userProfiles.add(caller, updatedProfile);
      };
    };
    "Conversation entry saved";
  };

  // Retrieve the caller's full conversation memory
  public query ({ caller }) func getConversationMemory() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get memory");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.conversationMemory };
    };
  };

  // Clear the caller's conversation memory
  public shared ({ caller }) func clearConversationMemory() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear memory");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = { profile with conversationMemory = [] };
        userProfiles.add(caller, updatedProfile);
      };
    };
    "Conversation memory cleared";
  };
};
