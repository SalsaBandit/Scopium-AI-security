#intial framework for user login/registration

import re
import os

class UserAuthentication:
    # Temporary storage for user data until a secure database is implemented
    users = {}
    USER_DATA_FILE = "user_data.txt"
    MAX_LENGTH = 10
    ALPHANUMERIC_PATTERN = r"^[a-zA-Z0-9]+$"
    extLoginAttempts = 0

    @staticmethod
    def main():
        # Temporary user until the database is established
        UserAuthentication.users["user1"] = "password1"
        UserAuthentication.save_user_data()
        UserAuthentication.load_user_data()

        choice = 0

        while choice != 3:
            print("1. Register new user")
            print("2. Login")
            print("3. Exit")
            choice = int(input("Enter choice: "))

            if choice == 1:
                UserAuthentication.register_user()
            elif choice == 2:
                logged_in = UserAuthentication.login_user()
                if logged_in:
                    break
            elif choice == 3:
                print("Goodbye!")
            else:
                print("Invalid choice. Please try again.")

    @staticmethod
    def register_user():
        username = input("Enter a username: ")
        password = input("Enter a password: ")

        if (UserAuthentication.is_alphanumeric(username) and
            UserAuthentication.is_alphanumeric(password) and
            len(username) <= UserAuthentication.MAX_LENGTH and
            len(password) <= UserAuthentication.MAX_LENGTH):
            
            if username not in UserAuthentication.users:
                UserAuthentication.users[username] = password
                UserAuthentication.save_user_data()
                print("Registration successful!\n")
            else:
                print("Username already exists. Please choose a different one.\n")
        else:
            print("Username and password may only contain letters and numbers,")
            print("and must be no more than 10 characters total.\n")

    @staticmethod
    def is_alphanumeric(string):
        return re.match(UserAuthentication.ALPHANUMERIC_PATTERN, string) is not None

    @staticmethod
    def login_user():
        logged_in = False
        login_attempts = 0

        while not logged_in:
            username = input("Enter your username: ")
            password = input("Enter your password: ")

            if (UserAuthentication.is_alphanumeric(username) and
                UserAuthentication.is_alphanumeric(password) and
                len(username) <= UserAuthentication.MAX_LENGTH and
                len(password) <= UserAuthentication.MAX_LENGTH):
                
                if username in UserAuthentication.users and UserAuthentication.users[username] == password:
                    print("\0")  # Print null byte
                    logged_in = True
                else:
                    print("Login failed. Please check your username and password.")
                    choice = input("Would you like to try again? (y/n): ").lower()
                    if choice != 'y':
                        break
                    login_attempts += 1
                    if login_attempts < 3:
                        print(f"You have {3 - login_attempts} login attempt(s) remaining.\n")
                    else:
                        print("Maximum login attempts reached. Exiting to main menu.\n")
                        break
            else:
                print("Username and password may only contain letters and numbers,")
                print("and must be no more than 10 characters total.\n")

        return logged_in

    @staticmethod
    def login_user_external(username, password):
        # Temporary user credentials for demonstration
        UserAuthentication.users["user1"] = "password1"
        err_msg = None

        if (UserAuthentication.is_alphanumeric(username) and
            UserAuthentication.is_alphanumeric(password) and
            len(username) <= UserAuthentication.MAX_LENGTH and
            len(password) <= UserAuthentication.MAX_LENGTH):
            
            if username in UserAuthentication.users and UserAuthentication.users[username] == password:
                return err_msg
            else:
                UserAuthentication.extLoginAttempts += 1
                if UserAuthentication.extLoginAttempts < 3:
                    err_msg = f"You have {3 - UserAuthentication.extLoginAttempts} login attempt(s) remaining."
                else:
                    err_msg = "Maximum login attempts reached. Exiting to main menu."
        else:
            err_msg = ("Username and password may only contain letters and numbers,\n"
                       "and must be no more than 10 characters total.")
        return err_msg

    @staticmethod
    def save_user_data():
        try:
            with open(UserAuthentication.USER_DATA_FILE, 'w') as f:
                for username, password in UserAuthentication.users.items():
                    f.write(f"{username} {password}\n")
        except IOError as e:
            print(f"Error saving user data: {e}")

    @staticmethod
    def load_user_data():
        if os.path.exists(UserAuthentication.USER_DATA_FILE):
            try:
                with open(UserAuthentication.USER_DATA_FILE, 'r') as f:
                    for line in f:
                        username, password = line.strip().split()
                        UserAuthentication.users[username] = password
            except IOError as e:
                print(f"Error loading user data: {e}")

if __name__ == "__main__":
    UserAuthentication.main()
