
# DEPENDENCIES #

include $(TOOLS_MAKE_LIB_DIR)/deps/david.mk


# TARGETS #

# Check dependencies.
#
# This target checks dependencies for updates.

check-deps: check-javascript-deps

.PHONY: check-deps

