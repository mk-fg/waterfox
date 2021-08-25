//
// Simple test-binary for trying to access a file from within containment profile.
// Access must fail with EACCES / EPERM to return "true", otherwise it'll return "false".
// Intended to be used from browser.runtime.sendNativeMessage() in extension.
// Needs ~/.mozilla/native-messaging-hosts/fs_access_check.json - see new-tab ext here.
//
// Build: gcc -O2 -o fs-access-check fs-access-check.c && strip fs-access-check
// Run: ./fs-access-check
//

#include <stdint.h>
#include <fcntl.h>
#include <errno.h>
#include <unistd.h>
#include <string.h>

char *test_path = "/etc/motd";
int32_t req_len = 0; char req_buff[256];
char res_success_len = 8, *res_success = "\4\0\0\0true";
char res_fail_len = 9, *res_fail = "\5\0\0\0false";

int main(int argc, char **argv) {
	while (read(STDIN_FILENO, &req_len, 4) == 4) {
		if ( req_len > 256 ||
			read(STDIN_FILENO, &req_buff, req_len) <= 0 ) return 139;
		if ( open(test_path, O_RDONLY) == -1
				&& (errno == EACCES || errno == EPERM) )
			{ write(STDOUT_FILENO, res_success, res_success_len); }
		else { write(STDOUT_FILENO, res_fail, res_fail_len); } }
}
